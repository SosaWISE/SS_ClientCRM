define('src/slick/vm.slickgrid', [
  'slick',
  'ko',
  'src/core/strings',
  'src/core/utils',
  'src/core/vm.base',
], function(
  Slick,
  ko,
  strings,
  utils,
  BaseViewModel
) {
  "use strict";

  ko.bindingHandlers.slickgrid = {
    init: function(element, valueAccessor) {
      var gridVM = valueAccessor();
      gridVM.onBound(element);
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

    // find plugins in columns
    _this.plugins = [];
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
    _this.list.subscribe(function() {
      var grid = _this.grid;
      if (grid) {
        // update visuals
        grid.resizeCanvas(); // important when a scrollbar first appears
        grid.render();
      }
    });

    _this.active = ko.observable(false);
  }
  utils.inherits(SlickGridViewModel, BaseViewModel);

  SlickGridViewModel.prototype.onBound = function(element) {
    // create a new grid everytime this view model is bound/rebound
    var _this = this;
    if (_this.grid) {
      _this.grid.destroy();
      _this.grid = null;
    }
    setTimeout(function() {
      _this.grid = new Slick.Grid(element, _this.list(), _this.columns, _this.options);
      _this.plugins.forEach(function(plugin) {
        _this.grid.registerPlugin(plugin);
      });
    }, 0);
  };

  SlickGridViewModel.formatters = {
    currency: function YesNoFormatter(row, cell, value /*, columnDef, dataContext*/ ) {
      return strings.decorators.c(value);
    },
    likecurrency: function YesNoFormatter(row, cell, value /*, columnDef, dataContext*/ ) {
      return strings.decorators.c(value).replace('$', '');
    },
  };

  return SlickGridViewModel;
});
