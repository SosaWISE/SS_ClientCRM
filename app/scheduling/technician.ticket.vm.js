define('src/scheduling/technician.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/scheduling/technician.ticket.gvm',
  'src/scheduling/technician.ticket.info.vm',
  'src/app',
  //'ko',
  //'src/ukov',
  'src/core/controller.vm',
  'src/core/utils',
], function(
  dataservice,
  ComboViewModel,
  notify,
  TechnicianTicketGridViewModel,
  TechTicketInfoViewModel,
  app,
  //ko,
  //ukov
  ControllerViewModel,
  utils
) {
  'use strict';

  var schema;

  schema = {
    _model: true
  };


  function TechTicketsViewModel(options) {
    var _this = this;
    TechTicketsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.technicianTicketGvm = new TechnicianTicketGridViewModel({
      ticketInfo: function(ticket) {
        showTicketInfo(_this, ticket);
      },
    });

    //
    // events
    //
  }
  utils.inherits(TechTicketsViewModel, ControllerViewModel);
  TechTicketsViewModel.prototype.viewTmpl = 'tmpl-technician-tickets';

  TechTicketsViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // override me
    var _this = this;
    //Initialize empty grid
    _this.technicianTicketGvm.list([]);
  };

  TechTicketsViewModel.prototype.onActivate = function() {
    var _this = this;
    //Initialize empty grid
    this.technicianTicketGvm.list([]);
    //load all tickets for this technician id
    load_tickets(_this.technicianTicketGvm); //, join.add());
  };

  function load_tickets(cvm, cb) {
    cvm.list([]);
    dataservice.scheduleenginesrv.SeTicketList.read({
      id: app.user.peek().GPEmployeeID,
      link: 'TID',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Code === 0) {
        //Update inventoryListGvm grid
        cvm.list(resp.Value);
      } else {
        notify.warn('No records found.', null, 3);
      }
    }));
  }

  function showTicketInfo(_this, ticket) {
    _this.layersVm.show(new TechTicketInfoViewModel({
      title: 'Technician Ticket Info',
      rowObj: ticket,
      layersVm: _this.layersVm,
    }), function onClose() {
      load_tickets(_this.technicianTicketGvm);
    });
  }

  return TechTicketsViewModel;
});
