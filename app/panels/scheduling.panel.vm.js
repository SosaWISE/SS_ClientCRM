define('src/panels/scheduling.panel.vm', [
  'ko',
  'src/core/helpers',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  helpers,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  //load inventory dependencies
  var deps = {},
    ensureDeps = helpers.onetimer(function loadDeps(cb) {
      require([
        'src/scheduling/service.ticket.vm',
        'src/scheduling/schedule.vm',
        //'src/scheduling/report.inventory.vm',
      ], function() {
        var args = arguments;
        deps.ServiceTicketViewModel = args[0];
        deps.ScheduleViewModel = args[1];
        //deps.ReportInventoryViewModel = args[2];

        cb();
      });
    });

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

  SchedulingViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this,
      cb = join.add();

    ensureDeps(function() {
      _this.list([
        new deps.ServiceTicketViewModel({
          routeName: 'scheduling',
          pcontroller: _this,
          id: 'serviceticket',
          title: 'Service Ticket'
        }),
        new deps.ScheduleViewModel({
          routeName: 'scheduling',
          pcontroller: _this,
          id: 'schedule',
          title: 'Schedule'
        }),
        // new deps.ReportInventoryViewModel({
        //   routeName: 'inventory',
        //   pcontroller: _this,
        //   id: 'audit',
        //   title: 'Audit'
        // }),
      ]);
      cb();
    });
  };

  return SchedulingViewModel;
});
