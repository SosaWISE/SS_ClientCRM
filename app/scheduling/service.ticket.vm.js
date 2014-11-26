define('src/scheduling/service.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/router',
  'src/core/controller.vm',
  'src/scheduling/service.ticket.gvm',
  'src/scheduling/ticket.editor.vm',
  'src/slick/slickgrid.vm',
  'src/slick/rowevent',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  Router,
  ControllerViewModel,
  ServiceTicketGridViewModel,
  TicketEditorViewModel,
  SlickGridViewModel,
  RowEvent,
  ko,
  ukov
) {
  "use strict";

  var schema;
  schema = {
    _model: true,
    TicketStatus: {},
  };

  function ServiceTicketViewModel(options) {
    var _this = this;
    ServiceTicketViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.data = ukov.wrap(_this.item || {
      TicketStatus: null,
    }, schema);

    //Ticket history grid
    _this.serviceTicketGvm = new ServiceTicketGridViewModel({
      edit: function(ticket, cb) {
        showTicketEditor(_this, utils.clone(ticket), cb);
      }
    });

    //Ticket status dropdown
    _this.data.ticketStatusCvm = new ComboViewModel({
      selectedValue: _this.data.TicketStatus,
      fields: {
        value: 'StatusCodeID',
        text: 'StatusCode',
      },
    });

    //events
    //
    _this.cmdNewTicket = ko.command(function(cb /*, vm*/ ) {
      _this.layersVm.show(new TicketEditorViewModel({
        pcontroller: _this,
        title: 'Create New Service Ticket'
      }), function() {
        reloadTickets(_this, cb);
      });
      cb();
    });

    _this.data.ticketStatusCvm.selectedValue.subscribe(function() {
      reloadTickets(_this);
    });
  }

  utils.inherits(ServiceTicketViewModel, ControllerViewModel);
  ServiceTicketViewModel.prototype.viewTmpl = 'tmpl-service-ticket';

  //
  // members
  //

  ServiceTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    //Initialize empty grid
    this.serviceTicketGvm.list([]);
    //load status list
    load_ticketStatusList(_this.data.ticketStatusCvm, join.add());
  };

  ServiceTicketViewModel.prototype.onActivate = function() { // override me
    var _this = this;
    //set default to All and load all tickets
    _this.data.TicketStatus(0);
    //load tickets
    reloadTickets(_this);
  };

  function reloadTickets(_this, cb) {
    var statusId = _this.data.TicketStatus.peek();
    if (statusId == null) {
      return;
    }
    load_tickets(statusId, 'TSCID', _this.serviceTicketGvm, cb);
  }

  function showTicketEditor(_this, ticket, cb) {
    var vm = new TicketEditorViewModel({
      pcontroller: _this,
      title: "Update Ticket",
      ticket: ticket
    });
    _this.layersVm.show(vm, cb);
  }

  function load_ticketStatusList(cvm, cb) {
    cvm.setList([]);
    dataservice.scheduleenginesrv.TicketStatusCodeList.read({}, function(val) {
      val.unshift({
        StatusCodeID: 0,
        StatusCode: 'All'
      });
      cvm.setList(val);
    }, cb);
  }

  function load_tickets(id, link, cvm, cb) {
    cvm.list([]);
    dataservice.scheduleenginesrv.SeTicketList.read({
      id: id,
      link: link,
    }, cvm.list, utils.safeCallback(cb, utils.noop, notify.error));
  }

  return ServiceTicketViewModel;
});
