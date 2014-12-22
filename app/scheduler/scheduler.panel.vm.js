define("src/scheduler/scheduler.panel.vm", [
  "src/scheduler/scheduleday.vm",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ScheduleDayViewModel,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";


  function SchedulerViewModel(options) {
    var _this = this;
    SchedulerViewModel.super_.call(_this, options);

    _this.list = _this.childs;

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    //events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(SchedulerViewModel, ControllerViewModel);

  //
  // members
  //

  SchedulerViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.list([
      new ScheduleDayViewModel({
        pcontroller: _this,
        id: "schedule",
        title: "Schedule",
        layersVm: _this.layersVm,
      }),
    ]);
  };

  return SchedulerViewModel;
});
