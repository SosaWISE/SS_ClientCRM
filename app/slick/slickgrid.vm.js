define('src/slick/slickgrid.vm', [
  'slick',
  'jquery',
  'ko',
  'src/core/onresize',
  'src/core/strings',
  'src/core/utils',
  'src/core/base.vm',
], function(
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
    BaseViewModel.ensureProps(_this, ['columns']);
    // columns: [{
    //	 id: 'col1',
    //	 name: 'Column Title',
    //	 field: 'Column1',
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
    _this.list = ko.observableArray(_this.list);
    _this.updateGrid = function() {
      var grid = _this.grid;
      if (grid) {
        // update grid layout
        grid.resizeCanvas();
        grid.render();
      }
    };
    _this.list.subscribe(function(list) {
      var grid = _this.grid;
      if (grid) {
        grid.setData(list, true);
        _this.updateGrid();
      }
    });

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

  SlickGridViewModel.prototype.onBound = function(element) {
    // create a new grid everytime this view model is bound/rebound
    var _this = this;
    if (_this.grid) {
      console.warn('grid is already bound');
      _this.unBound();
    }
    setTimeout(function() {
      _this.grid = new Slick.Grid(element, _this.list(), _this.columns, _this.gridOptions);
      if (!_this.noSelection) {
        _this.grid.setSelectionModel(new Slick.RowSelectionModel({
          // selectActiveRow: false
        }));
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
    }, 0);
  };
  SlickGridViewModel.prototype.unBound = function(element) {
    // destroy grid everytime this view model is unbound
    var _this = this,
      container;
    if (_this.grid) {
      container = _this.grid.getContainerNode();
      if (element && element !== container) {
        console.warn('unBound element doesn\'t match grid container', container, element);
      }
      _this.grid.destroy();
      _this.grid = null;
    }
  };


  SlickGridViewModel.formatters = {
    currency: function(row, cell, value /*, columnDef, dataContext*/ ) {
      return strings.decorators.c(value);
    },
    likecurrency: function(row, cell, value /*, columnDef, dataContext*/ ) {
      return strings.decorators.c(value).replace('$', '');
    },
  };

  return SlickGridViewModel;
});
