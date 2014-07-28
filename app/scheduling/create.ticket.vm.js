define('src/scheduling/create.ticket.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/combo.vm',
  'ko',
  'src/ukov',
  'src/dataservice',
  'src/core/joiner',
], function(
  notify,
  utils,
  BaseViewModel,
  ComboViewModel,
  ko,
  ukov,
  dataservice,
  joiner
) {
  "use strict";


  var schema;

  schema = {
    _model: true,
    TicketType: {},
    MoniNumber: {},
    Notes: {},
  };


  function CreateTicketViewModel(options) {
    var _this = this;
    CreateTicketViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Create New Service Ticket';

    //Set barcode field as first focusable
    _this.focusFirst = ko.observable(true);


    _this.data = ukov.wrap(_this.item || {
      TicketType: null,
      MoniNumber: null,
      Notes: null
    }, schema);

    //Ticket type dropdown
    _this.data.ticketTypeCvm = new ComboViewModel({
      selectedValue: _this.data.TicketType,
      fields: {
        value: 'TicketTypeID',
        text: 'TicketTypeName',
      },
    });



    //
    // events
    //

    //Create service ticket
    _this.cmdCreateTicket = ko.command(function(cb, vm) {
      createTicket(vm, cb);
      cb();
    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the barcode field
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

  }

  utils.inherits(CreateTicketViewModel, BaseViewModel);
  CreateTicketViewModel.prototype.viewTmpl = 'tmpl-create-ticket';
  CreateTicketViewModel.prototype.width = 400;
  CreateTicketViewModel.prototype.height = 'auto';

  CreateTicketViewModel.prototype.onActivate = function( /*routeData*/ ) {

    var _this = this,
      join = joiner();

    //load ticket type list
    load_ticketTypeList(_this.data.ticketTypeCvm, join.add());

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  CreateTicketViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_ticketTypeList(cvm, cb) {

    dataservice.scheduleenginesrv.TicketTypeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("TicketTypeList:" + JSON.stringify(resp.Value));

        //Set result to Location combo list
        cvm.setList(resp.Value);

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }

  //create service ticket
  function createTicket(vm, cb) {

    var param = {
      AccountID: 1,
      MoniNumber: vm.data.MoniNumber(),
      TicketTypeID: vm.data.TicketType(),
      StatusCodeID: 1,
      MoniConfirmation: 'MONI CONFIRM',
      TechConfirmation: '07/22/2014',
      TechnicianID: 1,
      TripCharges: 123.5,
      Appointment: 'APPOINTMENT TEST',
      AgentConfirmation: 'AGENT CONFIRMATION',
      ExpirationDate: '07/22/2014',
      Notes: vm.data.Notes(),

    };

    console.log(JSON.stringify("Create Ticket Parameters:" + JSON.stringify(param)));

    dataservice.scheduleenginesrv.SeTicket.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        console.log("Create Ticket:" + JSON.stringify(resp.Value));

        //clear service ticket fields
        vm.data.MoniNumber(null);
        vm.data.TicketType(null);
        vm.data.Notes(null);

      } else {
        notify.error(err);
      }
    }));

  }


  return CreateTicketViewModel;
});
