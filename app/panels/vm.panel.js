define('src/panels/vm.panel', [
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
], function(
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function PanelViewModel(options) {
    var _this = this;
    PanelViewModel.super_.call(_this, options);
  }
  utils.inherits(PanelViewModel, ControllerViewModel);

  PanelViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    join = join;
  };
  PanelViewModel.prototype.onActivate = function() { // overrides base
    this.setTitle(this.name);
  };

  return PanelViewModel;
});
