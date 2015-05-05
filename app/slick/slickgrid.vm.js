define("src/slick/slickgrid.vm", [
  "moment",
  "slick",
  "jquery",
  "ko",
  "src/core/onresize",
  "src/core/strings",
  "src/core/utils",
  "src/core/base.vm",
], function(
  moment,
  Slick,
  jquery,
  ko,
  onresize,
  strings,
  utils,
  BaseViewModel
) {
  "use strict";

  ko.bindingHandlers.slickgrid = {
    init: function(element, valueAccessor) {
      var gridVm = valueAccessor();
      gridVm.onBound(element);

      // get notified when the element is disposed
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        var gridVm = valueAccessor();
        gridVm.unBound(element);
      });
    },
  };

  function SlickGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ["columns"]);
    // columns: [{
    //   id: "col1",
    //   name: "Column Title",
    //   field: "Column1",
    // }]

    _this.plugins = _this.plugins || [];

    // find more plugins in columns
    _this.columns.forEach(function(col, index) {
      // test if column is a plugin
      if (utils.isFunc(col.init) && utils.isFunc(col.getColumnDefinition)) {
        _this.plugins.push(col);
        // overwrite column with real column definition
        _this.columns[index] = col.getColumnDefinition();
      }
    });

    _this.gridOptions = _this.gridOptions || {};
    if (_this.dataView) {
      // Make the grid respond to DataView change events.
      _this.dataView.onRowCountChanged.subscribe(function( /*e, args*/ ) {
        var grid = _this.grid;
        if (grid) {
          grid.updateRowCount();
          grid.render();
        }
      });
      _this.dataView.onRowsChanged.subscribe(function(e, args) {
        var grid = _this.grid;
        if (grid) {
          if (args.rows.length === 0) {
            //@HACK: when rows is empty rerender entire grid
            grid.invalidateAllRows();
          } else {
            grid.invalidateRows(args.rows);
          }
          grid.render();
        }
      });
    } else if (!_this.list || !ko.isObservable(_this.list)) {
      _this.list = ko.observableArray(_this.list);
    }
    _this.updateGrid = function() { // ensure correct scope
      var grid = _this.grid;
      if (grid) {
        // update grid layout
        grid.resizeCanvas();
        grid.render();
      }
    };
    if (_this.list) {
      _this.list.subscribe(function(list) {
        var grid = _this.grid;
        if (grid) {
          grid.setData(list, _this.scrollToTop); // false - do not scroll to top
          _this.updateGrid();
          if (_this.handleSelectedRowsChanged) {
            _this.handleSelectedRowsChanged(null, {
              grid: grid,
              rows: grid.getSelectedRows(),
            });
          }
        }
      });
    }

    if (_this.onSelectedRowsChanged) {
      _this.handleSelectedRowsChanged = function(e, data) {
        var i, length = data.rows.length,
          rows = new Array(length);
        for (i = 0; i < length; i++) {
          rows[i] = data.grid.getDataItem(data.rows[i]);
        }
        _this.onSelectedRowsChanged(rows);
      };
    }

    // try to create context menu
    if (utils.isFunc(_this.augmentMenuVm)) {
      _this.menuVm = {
        visible: ko.observable(false),
        position: ko.observable({
          top: 0,
          left: 0,
        }),
        show: function(e) {
          e.preventDefault();
          var offset = jquery(e.currentTarget).offset();
          _this.menuVm.position({
            top: e.clientY - offset.top + 24,
            left: e.clientX - offset.left,
          });
          _this.menuVm.cell = _this.grid.getCellFromEvent(e);
          _this.menuVm.visible(true);
          // unbind to prevent multiple event listeners
          jquery("body").off("click", _this.menuVm.hide);
          // hide whenever something else is clicked
          jquery("body").one("click", _this.menuVm.hide);
        },
        hide: function() {
          _this.menuVm.visible(false);
        },
      };
      _this.augmentMenuVm(_this.menuVm);
    }

    _this.active = ko.observable(false);
  }
  utils.inherits(SlickGridViewModel, BaseViewModel);
  SlickGridViewModel.ensureProps = BaseViewModel.ensureProps;
  SlickGridViewModel.prototype.dataView = null;

  SlickGridViewModel.prototype.onBound = function(element) {
    // create a new grid everytime this view model is bound/rebound
    var _this = this;
    if (_this.grid) {
      console.warn("grid is already bound");
      _this.unBound();
    }
    _this.bindTimeoutId = window.setTimeout(function() {
      _this.bindTimeoutId = 0;

      _this.grid = new Slick.Grid(element, _this.dataView || _this.list(), _this.columns, _this.gridOptions);
      if (!_this.noSelection) {
        var selectionModel = new Slick.RowSelectionModel({
          // selectActiveRow: false
        });
        _this.grid.setSelectionModel(selectionModel);
        if (_this.handleSelectedRowsChanged) {
          _this.grid.onSelectedRowsChanged.subscribe(_this.handleSelectedRowsChanged);
        }
      }
      if (_this.dataView && _this.dataView.options && _this.dataView.options.groupItemMetadataProvider) {
        _this.grid.registerPlugin(_this.dataView.options.groupItemMetadataProvider);
      }
      _this.plugins.forEach(function(plugin) {
        _this.grid.registerPlugin(plugin);
      });
      if (_this.menuVm) {
        _this.grid.onContextMenu.subscribe(function(e) {
          _this.menuVm.show(e);
        });
      }
      onresize(_this.grid.getContainerNode(), _this.updateGrid);

      // re-set selected rows
      if (_this._prevSelectedRows) {
        _this.setSelectedRows(_this._prevSelectedRows);
      }

      // incase explicitInitialization is set to true
      _this.grid.init();
    }, 9);
  };
  SlickGridViewModel.prototype.unBound = function(element) {
    // destroy grid everytime this view model is unbound
    var _this = this,
      container;

    // make sure we do not bind
    window.clearTimeout(_this.bindTimeoutId);
    _this.bindTimeoutId = 0;

    if (_this.grid) {
      container = _this.grid.getContainerNode();
      if (element && element !== container) {
        console.warn("unBound element does not match grid container", container, element);
      }
      if (!_this.noSelection) {
        // store selected rows
        _this._prevSelectedRows = _this.grid.getSelectedRows();
      }
      //
      _this.grid.onSelectedRowsChanged.unsubscribe(_this.handleSelectedRowsChanged);
      _this.grid.destroy(); // also unregisters all plugins
      _this.grid = null;
    }
  };

  SlickGridViewModel.prototype.getData = function() {
    var _this = this;
    if (_this.grid) {
      return _this.grid.getData();
    } else {
      return _this.dataView || _this.list.peek();
    }
  };

  SlickGridViewModel.prototype.getSelectedRows = function() {
    var _this = this;
    if (_this.grid) {
      return _this.grid.getSelectedRows();
    }
    return [];
  };
  SlickGridViewModel.prototype.setSelectedRows = function(rows) {
    var _this = this;
    if (_this.grid) {
      _this.grid.setSelectedRows(rows);
    }
  };
  SlickGridViewModel.prototype.scrollRowIntoView = function(row, doPaging) {
    var _this = this;
    if (_this.grid) {
      _this.grid.scrollRowIntoView(row, doPaging);
    }
  };
  SlickGridViewModel.prototype.resetActiveCell = function() {
    var _this = this;
    if (_this.grid) {
      _this.grid.resetActiveCell();
    }
  };

  //Not sure if this is the right place to add this here.
  SlickGridViewModel.prototype.deleteRow = function(row) {
    var _this = this,
      data = _this.grid.getData();

    data.splice(row, 1);
    _this.grid.setData(data);
    _this.grid.render();

  };


  SlickGridViewModel.formatters = {
    currency: function(row, cell, value /*, columnDef, dataContext*/ ) {
      return strings.formatters.currency(value);
    },
    likecurrency: function(row, cell, value /*, columnDef, dataContext*/ ) {
      return strings.formatters.likecurrency(value);
    },
    yesNoFormatter: function(row, cell, value) {
      return value ? "yes" : "no";
    },
    xFormatter: function(row, cell, value) {
      return value ? "X" : "";
    },
    date: function(row, cell, value) {
      return strings.formatters.date(value);
    },
    datetime: function(row, cell, value) {
      return strings.formatters.datetime(value);
    },
    phone: function(row, cell, value) {
      return strings.formatters.phone(value);
    },
  };

  return SlickGridViewModel;
});
