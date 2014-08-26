define('src/scheduling/scheduling.panel.vm', [
  'src/scheduling/service.ticket.vm',
  'src/scheduling/schedule.vm',
  'src/scheduling/service.technician.vm',
  'ko',
  'src/core/helpers',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ServiceTicketViewModel,
  ScheduleViewModel,
  TechnicianViewModel,
  ko,
  helpers,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";


  function SchedulingViewModel(options) {
    var _this = this;
    SchedulingViewModel.super_.call(_this, options);

    _this.title = 'Scheduling';
    _this.list = _this.childs;

    //
    //events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(SchedulingViewModel, ControllerViewModel);

  //
  // members
  //

  SchedulingViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    //Original script
    /*  _this.list([
      new ServiceTicketViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'serviceticket',
        title: 'Service Ticket'
      }),
      new ScheduleViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'schedule',
        title: 'Schedule'
      }),
  */

    _this.list([
      new ServiceTicketViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'serviceticket',
        title: 'Service Ticket'
      }),
      new ScheduleViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'schedule',
        title: 'Schedule'
      }),
      new TechnicianViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'servicetechnician',
        title: 'Service Technician'
      }),
    ]);
    join.add()();
  };

  return SchedulingViewModel;
});
