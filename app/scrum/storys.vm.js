define("src/scrum/storys.vm", [
  'src/slick/dragdrop',
  "src/slick/headerfilter",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "slick",
  "src/scrum/story.editor.vm",
  "src/ukov",
  "ko",
  "src/core/strings",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  DragDrop,
  HeaderFilter,
  RowEvent,
  SlickGridViewModel,
  Slick,
  StoryEditorViewModel,
  ukov,
  ko,
  strings,
  utils,
  ControllerViewModel
) {
  "use strict";

  var filtersSchema = {
    _model: true,
    Name: {},
  };

  function StorysViewModel(options) {
    var _this = this;
    StorysViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "pcontroller",
      "accepts",
      "takes",
      "rsort",
    ]);
    ControllerViewModel.ensureProps(_this.pcontroller, [
      "dragHub",
      "layersVm",
      "storyUpdated",
      "taskUpdated",
    ]);

    _this.filters = ukov.wrap({
      Name: "",
    }, filtersSchema);

    _this.indentOffset = _this.indentOffset || 0;
    var indentOffset = _this.indentOffset;

    initDataView(_this);
    var dv = _this.dv;

    _this.gvm = new SlickGridViewModel({
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
          // canDropItem: _this.canDropItem.bind(_this),
          // dropItem: _this.dropItem.bind(_this),
          dragHub: _this.pcontroller.dragHub,
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
            if (!item._metadata.collapsed) {
              item._metadata.collapsed = true;
            } else {
              item._metadata.collapsed = false;
            }
            dv.updateItem(item._metadata.sid, item);
          },
        }),
        new HeaderFilter({
          fields: ["Name", "sid"],
          updateFieldFilter: _this.updateFieldFilter.bind(_this),
        }),
      ],
      columns: [ //
        {
          id: "Row",
          name: "Row",
          width: 40,
          formatter: function(row, cell, value, columnDef, item) {
            return dv.getIdxById(item._metadata.sid) + 1;
          },
        }, {
          id: "sid",
          name: "ID",
          width: 50,
          behavior: "move",
          // resizable: false,
          formatter: function(row, cell, value, columnDef, item) {
            return item._metadata.sid;
          },
        }, {
          id: "psid",
          name: "PID",
          width: 50,
          formatter: function(row, cell, value, columnDef, item) {
            return item._metadata.psid;
          },
        }, {
          id: "Name",
          name: "Name",
          field: "Name",
          width: 500,
          behavior: "dropChild",
          formatter: function(row, cell, value, columnDef, item) {
            value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * (item._metadata.indent + indentOffset)) + "px'></span>";
            var idx = dv.getIdxById(item._metadata.sid);
            var nextItem = dv.getItemByIdx(idx + 1);
            if (nextItem && nextItem._metadata.indent > item._metadata.indent) {
              if (item._metadata.collapsed) {
                return spacer + " <span class='toggle fa fa-caret-right'></span>&nbsp;" + value;
              } else {
                return spacer + " <span class='toggle fa fa-caret-down'></span>&nbsp;" + value;
              }
            } else {
              return spacer + " <span class='toggle'></span>&nbsp;" + value;
            }
          },
        }, {
          id: "Points",
          name: "Points",
          field: "Points",
          width: 70,
          minWidth: 50,
        }, {
          id: "SortOrder",
          name: "SortOrder",
          field: "SortOrder",
          width: 70,
          minWidth: 50,
        },
      ],
    });

    //
    // events
    //
  }
  utils.inherits(StorysViewModel, ControllerViewModel);
  StorysViewModel.prototype.viewTmpl = "tmpl-scrum_open";

  StorysViewModel.prototype.onLoad = function(routeData, extraData, join) {
    join.add()();
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
          case "s":
            _this.pcontroller.storyUpdated(result, true);
            break;
          case "t":
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
      case "s":
        vm = new StoryEditorViewModel(editorOptions);
        break;
      case "t":
        throw new Error("TaskEditorViewModel not implemented");
        // vm = new TaskEditorViewModel({
        //   storyId: parentId,
        //   item: item,
        //   taskSteps: _this.taskSteps,
        // });
        // break;
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


  StorysViewModel.prototype.canDropItem = function(fromDv, itemRow, beforeRow) {
    if (!(fromDv.vm instanceof StorysViewModel)) {
      return null;
    }

    var _this = this;
    var dv = _this.dv;
    var pIdx;
    var indentOffset = _this.indentOffset;
    var indentZero = (0 - indentOffset);
    var item = fromDv.getItem(itemRow);
    var nextItem = dv.getItem(beforeRow);
    var prevItem = dv.getItem(beforeRow - 1);

    if (!_this.accepts(item)) {
      return null;
    }

    if (item === nextItem || item === prevItem) {
      // don't move to the same position
      return null;
    }

    // items must be the same level of indentation
    if ((nextItem && item._metadata.indent !== nextItem._metadata.indent) ||
      (!nextItem && item._metadata.indent !== indentZero) // last and top
    ) {
      // else the item must come before an item with a greater indent
      // and the item must come after an item of the same level of indentation
      if ((item._metadata.indent !== (nextItem._metadata.indent + 1)) ||
        (
          (prevItem && prevItem._metadata.indent !== item._metadata.indent) ||
          (!prevItem && item._metadata.indent !== indentZero) // first and top
        )) {
        return null;
      }
      pIdx = dv.getRowById(prevItem ? prevItem._metadata.psid : (nextItem ? nextItem._metadata.psid : null));
    } else {
      pIdx = dv.getRowById(nextItem ? nextItem._metadata.psid : (prevItem ? prevItem._metadata.psid : null));
    }
    //
    return {
      type: 'before',
      row: beforeRow,
      parentRow: pIdx,
      item: item,
      cell: 3, // column
      indent: 15 * (item._metadata.indent + indentOffset), // indent pixels
    };
  };
  StorysViewModel.prototype.dropItem = function(fromDv, dropData, cb) {
    if (!utils.isFunc(cb)) {
      cb = utils.noop;
    }
    var _this = this;
    var item = utils.clone(dropData.item);
    var ctx = getDropContext(_this, dropData);

    // change SortOrder
    item.SortOrder = _this.rsort.getIntSort(
      (ctx.prev ? ctx.prev.SortOrder : null), (ctx.next ? ctx.next.SortOrder : null)
    );

    // set psid/ParentId
    var psid = null;
    var parentId = null;
    if (ctx.parent) {
      psid = ctx.parent.sid;
      parentId = ctx.parent.ID;
    }
    item._metadata.psid = psid;
    // item.ParentId = parentId;
    switch (item._metadata.type) {
      case "s":
        item.GroupId = parentId;
        break;
      case "t":
        item.StoryId = parentId;
        break;
      default:
        throw new Error("invalid type:" + item._metadata.type);
    }

    // edit item if this vm doesn't `take` it
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
    sid: '0',
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

    function myFilter(item) {
      // filter by sid
      if (!sidRegx.test(item._metadata.sid)) {
        return false;
      }
      // filter by name
      if (!nameRegx.test(item.Name)) {
        return false;
      }
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
        idx = 0;
      for (var i = 0, ii = items.length; i < ii; i++) {
        if (myFilter(items[i], args)) {
          retval[idx++] = items[i];
        }
      }
      return retval;
    };
    dv.uncompiledFilterWithCaching = function(items, args, cache) {
      var retval = [],
        idx = 0,
        item;
      for (var i = 0, ii = items.length; i < ii; i++) {
        item = items[i];
        if (cache[i]) {
          retval[idx++] = item;
        } else if (myFilter(item, args)) {
          retval[idx++] = item;
          cache[i] = true;
        }
      }
      return retval;
    };
    //
    dv.setItems([], "sid");
    dv.setFilter(myFilter);

    // sorting order
    function myComparer(a, b) {
      var result = 0;
      if (result === 0) {
        var ai = a._metadata.indent;
        var bi = b._metadata.indent;
        // go up until we're at the same indent level
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
    var preventReverse = true;
    dv.sort(myComparer, preventReverse);
    //
    dv.endUpdate();
  }

  function getDropContext(_this, dropData) {
    var dv = _this.dv;
    var row = dropData.row - 1;
    var itemIndent = dropData.item._metadata.indent;
    var currItem, prevItem, nextItem, parentItem;
    while (row > -1) {
      currItem = dv.getItem(row);
      if (currItem._metadata.indent === itemIndent) {
        prevItem = currItem;
        break;
      }
      if (currItem._metadata.indent < itemIndent) {
        // found the parent. this should probably never happen...
        prevItem = null;
        break;
      }
      row--;
    }
    currItem = dv.getItem(dropData.row);
    if (currItem._metadata.indent === itemIndent) {
      nextItem = currItem;
    }

    return {
      prev: prevItem,
      next: nextItem,
      parent: parentItem,
    };
  }

  return StorysViewModel;
});
