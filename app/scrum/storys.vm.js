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
      "rsort",
    ]);

    _this.filters = ukov.wrap({
      Name: "",
    }, filtersSchema);

    initDataView(_this);
    var dv = _this.dv;
    var indentOffset = _this.indentOffset || 0;

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
          insertSibling: _this.insertSibling.bind(_this),
          dragHub: _this.gridOptions.dragHub,
        }),
        new RowEvent({
          eventName: "onDblClick",
          fn: function(item) {
            _this.gridOptions.edit(item, function() {
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
            dv.updateItem(item.sid, item);
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
          formatter: function(row) {
            return row + 1;
          },
        }, {
          id: "sid",
          name: "ID",
          field: "sid",
          width: 50,
          behavior: "move",
          // resizable: false,
        }, {
          id: "psid",
          name: "PID",
          field: "psid",
          width: 50,
        }, {
          id: "Name",
          name: "Name",
          field: "Name",
          width: 500,
          behavior: "dropChild",
          formatter: function(row, cell, value, columnDef, item) {
            value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * (item._metadata.indent + indentOffset)) + "px'></span>";
            var idx = dv.getIdxById(item.sid);
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


  //
  //
  //
  //
  // @STARTHERE: insertSibling - it is somewhat working... but not really
  // @TODO: handle nesting (feature -> )story -> task
  // @TODO: handle when items are filtered out
  //
  //
  //
  //
  //
  StorysViewModel.prototype.insertSiblingTest = function(item, beforeData) {
    if (!item.sid) {
      throw new Error('item no sid');
    }
    if (beforeData && !beforeData.sid) {
      throw new Error('beforeData no sid');
    }

    var _this = this;
    var dv = _this.dv;
    var idx = dv.getIdxById(item.sid);
    return _this.accepts(item, dv.getItemByIdx(item.psid),
      dv.getItemByIdx(idx - 1), dv.getItemByIdx(idx + 1));
  };
  StorysViewModel.prototype.insertSibling = function(item, beforeData, cb) {
    if (!utils.isFunc(cb)) {
      cb = utils.noop;
    }

    if (!item.sid) {
      throw new Error('item no sid');
    }
    if (beforeData && !beforeData.sid) {
      throw new Error('beforeData no sid');
    }

    var _this = this;
    var dv = _this.dv;
    var idxNext = beforeData ? dv.getIdxById(beforeData.sid) : dv.getLength();

    function getSortOrderAt(i) {
      var item = dv.getItemByIdx(i);
      return item ? item.SortOrder : null;
    }

    item = utils.clone(item);
    // if (parent) {
    //   item.ParentID = parent.ID;
    // }
    item.SortOrder = _this.rsort.getIntSort(getSortOrderAt(idxNext - 1), getSortOrderAt(idxNext));
    if (!_this.takes(item)) {
      // edit item but with more save restrictions
      _this.pcontroller.editItem(item, cb, {
        requirePoints: true,
      });
    } else {
      // save item
      _this.pcontroller.makeEditor(item).save(function(err, resp) {
        if (!err) {
          _this.pcontroller.storyUpdated(resp.Value);
        }
        cb();
      });
    }
  };


  StorysViewModel.prototype.getItem = function(sid) {
    var _this = this;
    return _this.map[sid];
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
    var sid = item.sid;

    // item._metadata = item._metadata || {
    //   collapsed: false,
    //   indent: 0,
    // };

    // ///////////////TESTING///////////////
    // if (item.ID % 2 === 0) {
    //   item.psid = "us" + (item.ID - 1);
    //   item._metadata.indent = 1;
    // } else if (item.ID % 3 === 0) {
    //   item.psid = "us" + (item.ID - 1);
    //   item._metadata.indent = 2;
    // }
    // ///////////////TESTING///////////////

    // update or add the item
    _this.map[sid] = item;
    var dv = _this.dv;
    var curr = dv.getItemById(sid);
    if (curr) {
      dv.updateItem(sid, item);
    } else {
      dv.addItem(item);
    }

    if (select) {
      var idx = dv.getIdxById(sid);
      var gvm = _this.gvm;
      gvm.setSelectedRows([idx]);
      gvm.scrollRowIntoView(idx);
    }

    if (!_this._updating) {
      // ensure the correct order
      //@REVIEW: this could be removed if we inserted in the correct order...
      dv.reSort();
    }
  };
  StorysViewModel.prototype.removeItem = function(item) {
    var _this = this;
    var sid = item.sid;

    delete _this.map[sid];

    // remove the item
    _this.dv.deleteItem(sid);

    // deselect rows
    _this.gvm.setSelectedRows([]);
  };

  var _top = {
    ID: 0,
    SortOrder: 1,
    _metadata: {
      collapsed: false,
      indent: 0,
    },
  };
  //
  function initDataView(_this) {
    var dv = new Slick.Data.DataView();
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
      if (!sidRegx.test(item.sid)) {
        return false;
      }
      // filter by name
      if (!nameRegx.test(item.Name)) {
        return false;
      }
      // exclude childs of collapsed items
      var parent = map[item.psid];
      while (parent) {
        if (parent._metadata.collapsed) {
          return false;
        }
        parent = map[parent.psid];
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
          b = map[b.psid] || _top; // go up to parent
        }
        while (b._metadata.indent < a._metadata.indent) {
          a = map[a.psid] || _top; // go up to parent
        }
        //
        if (a._metadata.indent === b._metadata.indent) {
          // same level
          if (a.psid !== b.psid) {
            // same parent
            a = map[a.psid] || _top; // go up to parent
            b = map[b.psid] || _top; // go up to parent
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

  return StorysViewModel;
});
