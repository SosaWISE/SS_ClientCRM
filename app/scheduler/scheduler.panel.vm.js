define("src/scheduler/scheduler.panel.vm", [
  "src/scheduler/techs.vm",
  "src/scheduler/scheduleticket.vm",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  TechsViewModel,
  ScheduleTicketViewModel,
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
      new TechsViewModel({
        pcontroller: _this,
        id: "techs",
        title: "Techs",
        layersVm: _this.layersVm,
      }),
      new ScheduleTicketViewModel({
        pcontroller: _this,
        id: "schedule",
        title: "Schedule",
        layersVm: _this.layersVm,
        ticketVm: {}, /////
      }),
    ]);
  };

  return SchedulerViewModel;
});
