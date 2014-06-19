define('src/panels/home.panel.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
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

  HomePanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    notify.info('/surveys/1/1', null, 0, {
      actions: {
        view: function() {
          _this.goTo({
            route: 'surveys',
            surveytypeid: 1,
            surveyid: 1,
          });
        },
      },
    });
    notify.info('/surveys/2/2', null, 0, {
      actions: {
        view: function() {
          _this.goTo({
            route: 'surveys',
            surveytypeid: 2,
            surveyid: 2,
          });
        },
      },
    });

    // notify.counter = 0;
    // setInterval(function() {
    //   notify.counter++;
    //   notify.info('message ' + notify.counter, null, 6);
    // }, 1000 * 1);

    join.add()();
  };
  HomePanelViewModel.prototype.onActivate = function() { // overrides base

  };
  HomePanelViewModel.prototype.onDeactivate = function() { // overrides base

  };
  return HomePanelViewModel;
});
