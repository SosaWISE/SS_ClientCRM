define('src/scheduling/service.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/scheduling/service.ticket.gvm',
  'src/scheduling/create.ticket.vm',
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
        value: 'StatusCodeID',
        text: 'StatusCode',
      },
    });


    //events
    //

    _this.cmdNewTicket = ko.command(function(cb /*, vm*/ ) {

      //Go to Enter Barcodes screen
      _this.layersVm.show(new CreateTicketViewModel({
        title: 'Create New Service Ticket'
      }), function onClose() {
        load_tickets({}, _this.serviceTicketGvm, cb);
      });


      cb();
    });

    _this.data.TicketStatus.subscribe(function(statusId, cb) {

      if (statusId) {
        load_tickets({
          id: statusId
        }, _this.serviceTicketGvm, cb);
      }

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

    //load all tickets created
    load_tickets({}, _this.serviceTicketGvm, join.add());

  };

  ServiceTicketViewModel.prototype.onActivate = function(cb) { // override me
    var _this = this;

    //load all tickets created
    load_tickets({}, _this.serviceTicketGvm, cb);

  };

  function load_ticketStatusList(cvm, cb) {

    dataservice.scheduleenginesrv.TicketStatusCodeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("TicketStatusCodeList:" + JSON.stringify(resp.Value));

        if (resp.Value.length > 0) {
          //Set result to Location combo list
          cvm.setList(resp.Value);
        }

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }

  function load_tickets(param, cvm, cb) {

    dataservice.scheduleenginesrv.SeTicketList.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("Tickets:" + JSON.stringify(resp.Value));

        //empty the list before adding some data
        cvm.list([]);

        //Update inventoryListGvm grid
        for (var x = 0; x < resp.Value.length; x++) {
          cvm.list.push(resp.Value[x]);
        }

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));
  }

  return ServiceTicketViewModel;
});
