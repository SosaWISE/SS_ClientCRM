define('src/vm.panel.home', [
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
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

  HomePanelViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;
    notify.notify('info', '/surveys/1000', 0, {
      view: function() {
        _this.goTo({
          route: 'surveys',
          surveyid: 1000,
        });
      },
    });
    notify.notify('info', '/surveys/1001', 0, {
      view: function() {
        _this.goTo({
          route: 'surveys',
          surveyid: 1001,
        });
      },
    });

    // notify.counter = 0;
    // setInterval(function() {
    //   notify.counter++;
    //   notify.notify('type', 'message ' + notify.counter, 6);
    // }, 1000 * 1);

    join.add()();
  };
  HomePanelViewModel.prototype.onActivate = function() { // overrides base
    this.setTitle(this.name);
  };
  HomePanelViewModel.prototype.onDeactivate = function() { // overrides base

  };
  return HomePanelViewModel;
});
