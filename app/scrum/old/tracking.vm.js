define('src/scrum/tracking.vm', [
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function TrackingViewModel(options) {
    var _this = this;
    TrackingViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['repo']);

    _this.sprint = ko.observable();

    //
    // events
    //
    _this.clickLeft = function(model) {
      if (model.TaskStepId > 1) {
        model.TaskStepId--;
        _this.repo.updateTask(model);
      }
    };
    _this.clickRight = function(model) {
      if (model.TaskStepId < 3) {
        model.TaskStepId++;
        _this.repo.updateTask(model);
      }
    };
  }
  utils.inherits(TrackingViewModel, ControllerViewModel);
  TrackingViewModel.prototype.viewTmpl = 'tmpl-scrum_tracking';

  TrackingViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.sprint(_this.repo.storyRepo.list()[0]);
    join.add()();
  };


  return TrackingViewModel;
});
