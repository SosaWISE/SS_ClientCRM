define('src/scheduling/scheduling.panel.vm', [
  'src/scheduling/service.ticket.vm',
  'src/scheduling/schedule.vm',
  'src/scheduling/technician.availability.vm',
  'src/scheduling/technician.ticket.vm',
  'src/scheduling/reschedule.ticket.vm',
  'ko',
  'src/core/layers.vm',
  'src/core/helpers',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ServiceTicketViewModel,
  ScheduleViewModel,
  TechAvailabilityViewModel,
  TechTicketsViewModel,
  ReScheduleTicketViewModel,
  ko,
  LayersViewModel,
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
  utils.inherits(SchedulingViewModel, ControllerViewModel);

  //
  // members
  //

  SchedulingViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.list([
      new ServiceTicketViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'serviceticket',
        title: 'Service Ticket',
        layersVm: _this.layersVm,
      }),
      new ScheduleViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'schedule',
        title: 'Schedule',
        layersVm: _this.layersVm,
      }),
      new TechAvailabilityViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'technicianavailability',
        title: 'Technician Availability',
        layersVm: _this.layersVm,
      }),
      new TechTicketsViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'techniciantickets',
        title: 'Technician Tickets',
        layersVm: _this.layersVm,
      }),
      new ReScheduleTicketViewModel({
        routeName: 'scheduling',
        pcontroller: _this,
        id: 'recheduletickets',
        title: 'Reschedule Tickets',
        layersVm: _this.layersVm,
      }),
    ]);
  };

  return SchedulingViewModel;
});
