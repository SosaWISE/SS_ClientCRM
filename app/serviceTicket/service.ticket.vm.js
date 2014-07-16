define('src/serviceTicket/service.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/serviceTicket/service.ticket.gvm',
  'src/serviceTicket/create.ticket.vm',
  'src/core/layers.vm',
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
  CreateTicketViewModel,
  LayersViewModel,
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

    //This a layer for creating new ticket
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //Ticket status dropdown
    _this.data.ticketStatusCvm = new ComboViewModel({
      selectedValue: _this.data.TicketStatus,
      fields: {
        value: 'TicketStatusID',
        text: 'TicketStatusCode',
      },
    });


    //events
    //

    _this.cmdNewTicket = ko.command(function(cb /*, vm*/ ) {

      //Go to Enter Barcodes screen
      _this.layersVm.show(new CreateTicketViewModel({
        title: 'Create New Service Ticket'
      }), function onClose( /*result*/ ) {

      });


      cb();
    });

  }

  utils.inherits(ServiceTicketViewModel, ControllerViewModel);
  ServiceTicketViewModel.prototype.viewTmpl = 'tmpl-service-ticket';

  //
  // members
  //

  ServiceTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;

    //Initialize empty grid
    this.serviceTicketGvm.list([]);

    //load status list
    load_ticketStatusList(_this.data.ticketStatusCvm, join.add());

  };

  function load_ticketStatusList(cvm, cb) {

    dataservice.ticketsrv.TicketStatusList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("TicketStatusList:" + JSON.stringify(resp.Value));

        //Set result to Location combo list
        cvm.setList(resp.Value);

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }


  return ServiceTicketViewModel;
});
