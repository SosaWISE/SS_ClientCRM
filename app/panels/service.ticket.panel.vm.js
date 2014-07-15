define('src/panels/service.ticket.panel.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/serviceTicket/service.ticket.gvm',
  'src/core/joiner',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel,
  ServiceTicketGridViewModel,
  joiner,
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

    _this.data = ukov.wrap(_this.item || {
      TicketStatus: null,
    }, schema);

    //Ticket history grid
    _this.serviceTicketGvm = new ServiceTicketGridViewModel({

    });

    //Ticket status dropdown
    _this.data.ticketStatusCvm = new ComboViewModel({
      selectedValue: _this.data.TicketStatus,
      nullable: true,
      // fields: {
      //   value: 'statusCode',
      //   text: 'Status',
      // },
    });


    //events
    //

    _this.cmdNewTicket = ko.command(function(cb /*, vm*/ ) {
      alert("@TODO create new ticket");
      cb();
    });

  }

  utils.inherits(ServiceTicketViewModel, ControllerViewModel);
  ServiceTicketViewModel.prototype.viewTmpl = 'tmpl-panel_serviceticket';

  //
  // members
  //

  ServiceTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    //var _this = this;
    join = join;

    //Initialize empty grid
    this.serviceTicketGvm.list([]);

  };

  return ServiceTicketViewModel;
});
