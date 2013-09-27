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

  function HomePanelViewModel(options) {
    var _this = this;
    HomePanelViewModel.super_.call(_this, options);
  }
  utils.inherits(HomePanelViewModel, ControllerViewModel);

  HomePanelViewModel.prototype.onLoad = function(cb) { // overrides base
    cb(false);

    var _this = this;
    notify.notify('fence', '/devices/devices/100169/edit', 0, {
      view: function() {
        _this.goToRoute({
          route: 'devices',
          tab: 'devices',
          id: 100169,
          action: 'edit',
        });
      },
    });
    notify.notify('fence', '/devices/devices/100203/edit', 0, {
      view: function() {
        _this.goToRoute({
          route: 'devices',
          tab: 'devices',
          id: 100203,
          action: 'edit',
        });
      },
    });

    // notify.counter = 0;
    // setInterval(function() {
    //   notify.counter++;
    //   notify.notify('type', 'message ' + notify.counter, 6);
    // }, 1000 * 1);
  };
  HomePanelViewModel.prototype.onActivate = function() { // overrides base
    this.setTitle(this.name);
  };
  return HomePanelViewModel;
});
