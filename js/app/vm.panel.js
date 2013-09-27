define([
  'notify',
  'utils',
  'vm.controller',
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

  PanelViewModel.prototype.onLoad = function(cb) { // overrides base
    cb(false);
  };
  PanelViewModel.prototype.onActivate = function() { // overrides base
    this.setTitle(this.name);
  };

  return PanelViewModel;
});
