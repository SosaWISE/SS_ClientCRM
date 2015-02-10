define("src/scrum/storys.vm", [
  "src/slick/buttonscolumn",
  "src/slick/draghub",
  "src/slick/dragdrop",
  "src/slick/headerfilter",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "slick",
  "src/scrum/scrum-cache",
  "src/scrum/task.editor.vm",
  "src/scrum/story.editor.vm",
  "src/ukov",
  "ko",
  "src/core/notify",
  "src/core/strings",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ButtonsColumn,
  DragHub,
  DragDrop,
  HeaderFilter,
  RowEvent,
  SlickGridViewModel,
  Slick,
  scrumcache,
  TaskEditorViewModel,
  StoryEditorViewModel,
  ukov,
  ko,
  notify,
  strings,
  utils,
  ControllerViewModel
) {
  "use strict";

  var filtersSchema = {
    _model: true,
    Name: {},
  };

  var _indentPixels = 15;

  var taskstepActionsMap = {
    1: { // Pending
      next: {
        stepid: 2,
        text: "Work on",
      },
      fail: null,
    },
    2: { // In-Progress
      next: {
        stepid: 3,
        text: "Done",
      },
      fail: null,
    },
    3: { // Complete
      next: {
        stepid: 2,
        text: "Restart",
      },
      fail: {
        stepid: 1,
        text: "Failed",
      },
    },
  };

  function StorysViewModel(options) {
    var _this = this;
    StorysViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      // "pcontroller",
      "accepts",
      "takes",
      "rsort",
    ]);
    if (_this.pcontroller) {
      ControllerViewModel.ensureProps(_this.pcontroller, [
        // "dragHub",
        "layersVm",
        "storyUpdated",
        "taskUpdated",
      ]);
    }

    // ensure dragHub is set
    var dragHub = ((_this.pcontroller) ? _this.pcontroller.dragHub : null) || new DragHub({
      cancelEditOnDrag: true,
    });

    _this.filters = ukov.wrap({
      Name: "",
    }, filtersSchema);

    _this.indentOffset = _this.indentOffset || 0;

    initDataView(_this);

    _this.gvm = new SlickGridViewModel({
      // noSelection: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 20,
        multiSelect: false,
        // these are needed for HeaderFilter
        showHeaderRow: true,
        headerRowHeight: 30,
        explicitInitialization: true,
      },
      dataView: _this.dv,
      plugins: [ //
        new DragDrop({
          vm: _this,
          dragHub: dragHub,
        }),
        new RowEvent({
          eventName: "onDblClick",
          fn: function(item) {
            _this.editItem(item, function() {
              // ??
            });
          },
        }),
        new RowEvent({
          eventName: "onClick",
          hasClass: "toggle",
          fn: function(item) {
            // get selected item
            var selectedItem = _this.dv.getItem(_this.gvm.getSelectedRows()[0]);
            _this.gvm.setSelectedRows([]);
            // toggle collapsed
            item._metadata.collapsed = !item._metadata.collapsed;
            _this.dv.updateItem(item._metadata.sid, item);
            // set selected item
            if (selectedItem) {
              _this.gvm.setSelectedRows([_this.dv.getRowById(selectedItem.sid)]);
            }
          },
        }),
        new HeaderFilter({
          fields: ["Name", "sid"],
          updateFieldFilter: _this.updateFieldFilter.bind(_this),
        }),
      ],
      columns: getColumns(_this, _this.indentOffset, _this.showState),
    });

    //
    // events
    //
  }
  utils.inherits(StorysViewModel, ControllerViewModel);
  StorysViewModel.prototype.viewTmpl = "tmpl-scrum_open";

  function getColumns(_this, indentOffset, showState) {
    var dv = _this.dv;
    var columns = [ //
      {
        behavior: "move",
        id: "Row",
        name: "Row",
        width: 40,
        formatter: function(row, cell, value, columnDef, item) {
          return dv.getIdxById(item._metadata.sid) + 1;
        },
      }, {
        behavior: "move",
        id: "sid",
        name: "ID",
        width: 50,
        // resizable: false,
        formatter: function(row, cell, value, columnDef, item) {
          return item._metadata.sid;
        },
      },
      // {
      //   behavior: "move",
      //   id: "psid",
      //   name: "PID",
      //   width: 50,
      //   formatter: function(row, cell, value, columnDef, item) {
      //     return item._metadata.psid;
      //   },
      // },
      {
        behavior: "move",
        // behavior: "dropChild",
        id: "Name",
        name: "Name",
        field: "Name",
        width: 500,
        formatter: function(row, cell, value, columnDef, item) {
          value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          var spacer = "<span style=\"display:inline-block;height:1px;width:" + (_indentPixels * (item._metadata.indent + indentOffset)) + "px\"></span>";
          var idx = dv.getIdxById(item._metadata.sid);
          var nextItem = dv.getItemByIdx(idx + 1);
          if (nextItem && nextItem._metadata.indent > item._metadata.indent) {
            if (item._metadata.collapsed) {
              return spacer + " <span class=\"toggle fa fa-caret-right\"></span>&nbsp;" + value;
            } else {
              return spacer + " <span class=\"toggle fa fa-caret-down\"></span>&nbsp;" + value;
            }
          } else {
            return spacer + " <span class=\"toggle\"></span>&nbsp;" + value;
          }
        },
      }, {
        id: "Points",
        name: "Estimate",
        field: "Points",
        width: 70,
        minWidth: 50,
        formatter: function(row, cell, value, columnDef, item) {
          var postfix;
          switch (item._metadata.type) {
            case "S":
              postfix = " pts";
              break;
            case "T":
              postfix = " hrs";
              break;
            default:
              postfix = "";
              break;
          }
          return (value == null ? "?" : value) + postfix;
        },
      },
    ];

    if (showState) {
      var taskstepsMap;
      // var btnFormat = "<a class=\"{0}\">{1}</a>";
      columns.push(new ButtonsColumn({
        id: "stateActions",
        name: "State",
        buttons: [ //
          {
            fn: function(item) {
              var action = taskstepActionsMap[item.StepId].next;
              notify.info("clicked [" + action.text + "] - change to " + taskstepsMap[action.stepid].Name);
            },
          }, {
            fn: function(item) {
              var action = taskstepActionsMap[item.StepId].fail;
              notify.info("clicked [" + action.text + "] - change to " + taskstepsMap[action.stepid].Name);
            },
          }
        ],
        width: 400,
        formatter: function(row, cell, value, columnDef, item) {
          if (item._metadata.type !== "T") {
            return "";
          }
          taskstepActionsMap = taskstepActionsMap;

          if (!taskstepsMap) {
            taskstepsMap = scrumcache.getMap("tasksteps");
            if (!taskstepsMap) {
              return "loading...";
            }
          }
          if (item) {
            var step = taskstepsMap[item.StepId];
            var result = step.Name + "&nbsp;&nbsp;";

            var action = taskstepActionsMap[item.StepId];
            result += getBtnAnchor(action.next);
            result += getBtnAnchor(action.fail);
            return result;
          }
          return null;
        },
      }));
    }

    columns.push({
      id: "SortOrder",
      name: "SortOrder",
      field: "SortOrder",
      width: 70,
      minWidth: 50,
    });

    return columns;
  }

  function getBtnAnchor(action) {
    if (!action) {
      return "<a></a>";
    }
    return strings.format("<a>[{0}]</a>&nbsp;&nbsp;", action.text);
  }

  StorysViewModel.prototype.onLoad = function(routeData, extraData, join) {
    scrumcache.ensure("tasksteps", join.add());
  };

  StorysViewModel.prototype.getItem = function(sid) {
    var _this = this;
    return _this.map[sid];
  };

  StorysViewModel.prototype.editItem = function(item, cb, editorOptions) {
    var _this = this,
      vm = _this.makeEditor(item, editorOptions);
    _this.pcontroller.layersVm.show(vm, createSaveHandler(_this, item, cb));
  };
  StorysViewModel.prototype.saveItem = function(item, cb, editorOptions) {
    var _this = this,
      vm = _this.makeEditor(item, editorOptions);
    vm.save(createSaveHandler(_this, item, cb));
  };

  function createSaveHandler(_this, item, cb) {
    return function(result) {
      if (result) {
        result.sid = item._metadata.sid;
        result._metadata = item._metadata;
        switch (result._metadata.type) {
          case "S":
            _this.pcontroller.storyUpdated(result, true);
            break;
          case "T":
            _this.pcontroller.taskUpdated(result, true);
            break;
          default:
            throw new Error("invalid item type: " + result._metadata.type);
        }
      }
      cb();
    };
  }
  StorysViewModel.prototype.makeEditor = function(item, editorOptions /*, parentId*/ ) {
    var vm,
      type = item._metadata.type;
    editorOptions = editorOptions || {};
    editorOptions.item = utils.clone(item);
    switch (type) {
      case "S":
        vm = new StoryEditorViewModel(editorOptions);
        break;
      case "T":
        // throw new Error("TaskEditorViewModel not implemented");
        vm = new TaskEditorViewModel(editorOptions);
        break;
      default:
        throw new Error("invalid edit item type: " + type);
    }
    return vm;
  };

  StorysViewModel.prototype.beginUpdate = function() {
    var _this = this;
    _this._updating = true;
    _this.dv.beginUpdate();
  };
  StorysViewModel.prototype.endUpdate = function() {
    var _this = this;
    if (_this._updating) {
      _this._updating = false;
      _this.dv.reSort();
      _this.dv.endUpdate();
    }
  };
  StorysViewModel.prototype.updateItem = function(item, select) {
    var _this = this;
    var sid = item._metadata.sid;

    // update or add the item
    _this.map[sid] = item;
    var dv = _this.dv;
    var curr = dv.getItemById(sid);
    if (curr) {
      dv.updateItem(sid, item);
    } else {
      dv.addItem(item);
    }

    //
    if (_this._updating) {
      return;
    }

    // ensure the correct order
    //@REVIEW: this could be removed if we inserted in the correct order...
    dv.reSort();
    //
    if (select) {
      var idx = dv.getIdxById(sid);
      var gvm = _this.gvm;
      gvm.setSelectedRows([idx]);
      gvm.scrollRowIntoView(idx);
    }
  };
  StorysViewModel.prototype.removeItem = function(item) {
    var _this = this;
    var results = [item];
    var dv = _this.dv;

    var idx = dv.getIdxById(item._metadata.sid);
    if (idx == null) {
      return [];
    }

    // get all sub-items
    var indent = item._metadata.indent;
    var subItem = dv.getItemByIdx(++idx);
    while (subItem && subItem._metadata.indent > indent) {
      results.push(subItem);
      subItem = dv.getItemByIdx(++idx);
    }

    // remove item and all sub-items
    results.forEach(function(item) {
      delete _this.map[item._metadata.sid];
      _this.dv.deleteItem(item._metadata.sid);
    });

    // deselect rows
    _this.gvm.setSelectedRows([]);

    // return removed items and sub-items
    return results;
  };

  function findByNum(dv, funcName, direction, matchIndent, num) {
    // direction determines the direction
    // if direction is positive this finds the next item
    // if direction is negative this finds the prev item
    var item = dv[funcName](num);
    if (!item) {
      return null;
    }
    while (item) {
      var currIndent = item._metadata.indent;
      if (currIndent === matchIndent) {
        // found a sibling
        return num;
      }
      if (currIndent < matchIndent) {
        // found a parent so there is no sibling
        return null;
      }
      num += direction;
      item = dv[funcName](num);
    }
    return null;
  }

  function findIndex(dv, direction, matchIndent, idx) {
    return findByNum(dv, "getItemByIdx", direction, matchIndent, idx);
  }

  function findRow(dv, direction, matchIndent, row) {
    return findByNum(dv, "getItem", direction, matchIndent, row);
  }

  StorysViewModel.prototype.canDropItem = function(fromDv, itemRow, beforeRow) {
    if (!(fromDv.vm instanceof StorysViewModel)) {
      return null;
    }

    //
    // @NOTE: index vs row
    //  - indexes are for all items in the grid and are not always visible
    //  - rows are visible in the grid
    //

    var _this = this;
    var dv = _this.dv;
    // var pIdx;
    var indentOffset = _this.indentOffset;
    var indentZero = (0 - indentOffset);
    var item = fromDv.getItem(itemRow);
    var itemIndent = item._metadata.indent;
    var afterRow = beforeRow - 1;

    // find a parentRow
    var parentRow = findRow(dv, -1, itemIndent - 1, afterRow);
    if (parentRow == null && itemIndent !== indentZero) {
      // item needs a parent, but no parent was found
      return null;
    }
    var parentItem = dv.getItem(parentRow);

    // get temp index
    var tmpIdx;
    var tmpItem = dv.getItem(beforeRow);
    if (tmpItem) {
      // get index of temp item
      tmpIdx = dv.getIdxById(tmpItem.sid);
    } else {
      tmpItem = dv.getItem(afterRow);
      if (tmpItem) {
        // get index of temp item
        tmpIdx = dv.getIdxById(tmpItem.sid) + 1;
      }
    }
    if (parentItem) {
      // find the following sibling of parent
      var parentSiblingIdx = findIndex(dv, 1, itemIndent - 1, dv.getIdxById(parentItem.sid) + 1);
      // ensure tmpIdx is not greater than sibling of parent
      if (parentSiblingIdx != null && parentSiblingIdx < tmpIdx) {
        tmpIdx = parentSiblingIdx;
        tmpItem = dv.getItemByIdx(tmpIdx);
      }
    }

    // get prev and next indexes based on temp index
    var prevIdx, nextIdx;
    if (tmpItem) {
      // find the next index with a matching indent
      nextIdx = findIndex(dv, 1, itemIndent, tmpIdx);
      if (nextIdx != null) {
        prevIdx = findIndex(dv, -1, itemIndent, nextIdx - 1);
      } else {
        prevIdx = findIndex(dv, -1, itemIndent, tmpIdx - 1);
      }
    } else {
      prevIdx = null;
      nextIdx = null;
    }
    // get items
    var prevItem = dv.getItemByIdx(prevIdx) || null;
    var nextItem = dv.getItemByIdx(nextIdx) || null;
    if (item === prevItem || item === nextItem) {
      // not changing positions
      return null;
    }

    // translate index to row
    var row;
    if (nextItem) {
      row = dv.getRowById(nextItem.sid);
      if (row == null) {
        // find next visible row
        row = findRow(dv, 1, itemIndent, beforeRow);
        if (row == null) {
          row = dv.getLength();
        }
      }
    } else if (prevItem) {
      row = dv.getRowById(prevItem.sid);
      if (row != null) {
        row += 1;
      } else {
        // find next visible row
        row = findRow(dv, 1, itemIndent, afterRow);
        if (row != null) {
          row += 1;
        } else {
          row = dv.getLength();
        }
      }
    } else if (parentItem) {
      row = parentRow + 1;
    } else {
      // row = null;
      return null;
    }

    //
    return {
      type: "before",
      row: row,
      parentRow: parentRow,
      item: item,
      parentItem: parentItem || null,
      nextItem: nextItem || null,
      prevItem: prevItem || null,
      cell: 2, // column
      indent: _indentPixels * (item._metadata.indent + indentOffset), // indent pixels
    };
  };
  StorysViewModel.prototype.dropItem = function(fromDv, dropData, cb) {
    if (!utils.isFunc(cb)) {
      cb = utils.noop;
    }
    var _this = this;
    var item = utils.clone(dropData.item);

    // change SortOrder
    item.SortOrder = _this.rsort.getIntSort(
      (dropData.prevItem ? dropData.prevItem.SortOrder : null), (dropData.nextItem ? dropData.nextItem.SortOrder : null)
    );

    // set psid/ParentId
    var psid = null;
    var parentId = null;
    if (dropData.parentItem) {
      psid = dropData.parentItem.sid;
      parentId = dropData.parentItem.ID;
    }
    item._metadata.psid = psid;
    // item.ParentId = parentId;
    switch (item._metadata.type) {
      case "S":
        item.ParentId = parentId;
        break;
      case "T":
        item.ParentId = parentId;
        break;
      default:
        throw new Error("invalid type:" + item._metadata.type);
    }

    // edit item if this vm does not `take` it
    if (!_this.takes(item)) {
      // edit item but with more save restrictions
      _this.editItem(item, cb, {
        strictValidation: true,
      });
    } else {
      // save item
      // _this.saveItem(item, cb, {
      _this.editItem(item, cb, {
        strictValidation: true,
      });
    }
  };

  var _top = {
    sid: "0",
    ID: 0,
    SortOrder: 1,
    _metadata: {
      collapsed: false,
      indent: 0,
    },
  };

  function initDataView(_this) {
    var dv = new Slick.Data.DataView();
    dv.vm = _this; // store pointer to this vm
    _this.dv = dv;
    var map = {};
    _this.map = map;

    var filterTimeout = 0;

    function toRegx(val) {
      if (!val) {
        return new RegExp(".*", "i");
      }
      val = strings.escapeRegExp(val);
      return new RegExp(".*" + val + ".*", "i");
    }
    var sidRegx = toRegx();
    var nameRegx = toRegx();

    function myFilter(item, args, outparams) {
      // filter by sid
      if (!sidRegx.test(item._metadata.sid)) {
        outparams.matches = false;
        return false;
      }
      // filter by name
      if (!nameRegx.test(item.Name)) {
        outparams.matches = false;
        return false;
      }
      // even if the parent is collapsed we still want to know if the item matched
      outparams.matches = true;

      // exclude childs of collapsed items
      var parent = map[item._metadata.psid];
      while (parent) {
        if (parent._metadata.collapsed) {
          return false;
        }
        parent = map[parent._metadata.psid];
      }
      //
      return true;
    }

    function runFilters() {
      Slick.GlobalEditorLock.cancelCurrentEdit();
      // refresh ui
      window.clearTimeout(filterTimeout);
      filterTimeout = window.setTimeout(dv.refresh, 10);
    }

    function filterChanged(prop, val, run) {
      switch (prop) {
        case "sid":
          val = toRegx(val);
          if (sidRegx.toString() === val.toString()) {
            return false;
          }
          sidRegx = val;
          break;

        case "Name":
          val = toRegx(val);
          if (nameRegx.toString() === val.toString()) {
            return false;
          }
          nameRegx = val;
          break;

        default:
          return false;
      }
      if (run) {
        runFilters();
      }
      return true;
    }
    Object.keys(_this.filters.doc).forEach(function(prop) {
      _this.filters[prop].subscribe(function(val) {
        filterChanged(prop, val, true);
      });
    });
    _this.updateFieldFilter = function(field, filter) {
      filterChanged(field, filter, true);
    };
    _this.setColumnFilters = function(columnFilters) {
      var run = false;
      Object.keys(columnFilters).forEach(function(prop) {
        run |= runFilters(prop, columnFilters[prop], false);
      });
      if (run) {
        runFilters();
      }
    };

    dv.beginUpdate();
    //
    //@REVIEW: update uncompiledFilter and uncompiledFilterWithCaching to inline the filter???
    dv.uncompiledFilter = function(items, args) {
      var retval = [],
        idx = 0,
        showMap = {},
        outparams = {
          matches: false,
        },
        item, i = items.length;
      // loop backwards so that childs are evaluated before parents
      while (i--) {
        item = items[i];
        if (showMap[item.sid] || myFilter(item, args, outparams)) {
          retval[idx++] = item;
          // add parent to show map to show parent even when it does not match the filter
          showMap[item._metadata.psid] = true;
        } else if (outparams.matches) {
          // show parent even when it or its parent(recursive) is collapsed
          showMap[item._metadata.psid] = true;
        }
      }
      // put in correct order
      retval.reverse();
      return retval;
    };
    dv.uncompiledFilterWithCaching = dv.uncompiledFilter;
    //
    dv.setItems([], "sid");
    dv.setFilter(true); //@NOTE: this should be the filter function but we are overridding uncompiledFilter. it needs a truthy value since getFilteredAndPagedItems uses it in an if statement

    // sorting order
    function myComparer(a, b) {
      var result = 0;
      if (result === 0) {
        var ai = a._metadata.indent;
        var bi = b._metadata.indent;
        // go up until we are at the same indent level
        while (a._metadata.indent < b._metadata.indent) {
          b = map[b._metadata.psid] || _top; // go up to parent
        }
        while (b._metadata.indent < a._metadata.indent) {
          a = map[a._metadata.psid] || _top; // go up to parent
        }
        //
        if (a._metadata.indent === b._metadata.indent) {
          // same level
          if (a._metadata.psid !== b._metadata.psid) {
            // same parent
            a = map[a._metadata.psid] || _top; // go up to parent
            b = map[b._metadata.psid] || _top; // go up to parent
          }
          // sort by SortOrder or ID
          if (b.SortOrder && a.SortOrder) {
            result = b.SortOrder - a.SortOrder;
          } else if (a.SortOrder) {
            result = -1;
          } else if (b.SortOrder) {
            result = 1;
          } else {
            result = b.ID - a.ID;
          }

          if (result === 0 && ai !== bi) {
            // comparing child and parent
            result = ai - bi;
          }
        } else {
          // different levels ???????
        }
      }
      return result;
    }
    var preventReverse = true; // ??ascending??
    dv.sort(myComparer, preventReverse);
    //
    dv.endUpdate();

    dv.getItemMetadata = function(row) {
      var item = this.getItem(row);
      var classes = [];

      if (item) {
        // if (item.rowClass) {
        //   classes.push(item.rowClass);
        // }

        var type = item._metadata.type;
        switch (type) {
          case "F":
            break;
          case "S":
            classes.push("story");
            break;
          case "T":
            // classes.push("task");
            if (item.StepId === 1) { // Pending
              classes.push("stale");
            } else if (item.StepId === 2) { // In Progress
              classes.push("inprogress");
            }
            break;
        }
      }
      return {
        cssClasses: classes.join(" "),
      };
    };
  }

  function ensureItemMetadata(item, type, currVm) {
    if (item._metadata) {
      return;
    }
    var metadata, sid = type + item.ID;

    if (currVm && currVm.getItem(sid)) {
      metadata = currVm.getItem(sid)._metadata;
    } else {
      metadata = {
        sid: sid,
        psid: null,
        type: type,
        collapsed: false,
        indent: 0,
      };
    }

    switch (type) {
      case "F":
        metadata.indent = 0;
        // metadata.psid = null;
        break;
      case "S":
        metadata.indent = 1;
        if (item.ParentId) {
          metadata.psid = "F" + item.ParentId;
        }
        break;
      case "T":
        metadata.indent = 2;
        metadata.psid = "S" + item.ParentId;
        break;
      default:
        throw new Error("invalid type:" + item._metadata.type);
    }

    item._metadata = metadata;
    item.sid = metadata.sid; // needed for DataView
  }
  StorysViewModel.ensureItemMetadata = ensureItemMetadata;

  function create(pcontroller, options) {
    return new StorysViewModel({
      pcontroller: pcontroller,
      indentOffset: utils.ifNull(options.indentOffset, -1), // default to -1
      accepts: options.accepts,
      takes: options.takes,
      rsort: options.rsort,
      showState: options.showState,
    });
  }
  StorysViewModel.create = create;

  return StorysViewModel;
});
