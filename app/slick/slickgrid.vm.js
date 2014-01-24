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
      var gridVM = valueAccessor();
      gridVM.onBound(element);

      // get notified when the element is disposed
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        var gridVM = valueAccessor();
        gridVM.unBound(element);
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
      if (typeof(col.init) === 'function' && typeof(col.getColumnDefinition) === 'function') {
        _this.plugins.push(col);
        // overwrite column with real column definition
        _this.columns[index] = col.getColumnDefinition();
      }
    });

    _this.options = _this.options || {};
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
      _this.grid = new Slick.Grid(element, _this.list(), _this.columns, _this.options);
      _this.grid.setSelectionModel(new Slick.RowSelectionModel({
        // selectActiveRow: false
      }));
      _this.plugins.forEach(function(plugin) {
        _this.grid.registerPlugin(plugin);
      });
      onresize(_this.grid.getContainerNode(), _this.updateGrid);
    }, 0);
  };
  SlickGridViewModel.prototype.unBound = function(element) {
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
