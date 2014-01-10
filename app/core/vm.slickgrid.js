define('src/core/vm.slickgrid', [
  'slick',
  'ko',
  'src/core/utils',
  'src/core/vm.base',
], function(
  Slick,
  ko,
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
    BaseViewModel.super_.call(_this, options);

    _this.list = ko.observableArray(_this.list);
    _this.columns = _this.columns || [];
    _this.options = _this.options || {};

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
    var _this = this;
    _this.grid = new Slick.Grid(element, _this.list(), _this.columns, _this.options);
  };

  return SlickGridViewModel;
});
