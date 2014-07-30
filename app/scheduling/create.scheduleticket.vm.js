define('src/scheduling/create.scheduleticket.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/combo.vm',
  'src/core/joiner',
  'ko',
  'src/ukov',
], function(
  $,
  fullCalendar,
  dataservice,
  notify,
  utils,
  BaseViewModel,
  ComboViewModel,
  joiner,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    ScheduleTicketID: {},
    ScheduleTicketType: {},
    ScheduleTicketAppointment: {},
    ScheduleTicketNotes: {},
    ScheduleAppointmentDate: {},
    ScheduleTravelTime: {}
  };


  function ScheduleTicketViewModel(options) {
    var _this = this;
    ScheduleTicketViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Create New Schedule Ticket';

    _this.data = ukov.wrap(_this.item || {
      ScheduleTicketID: null,
      ScheduleTicketType: null,
      ScheduleTicketAppointment: null,
      ScheduleTicketNotes: null,
      ScheduleAppointmentDate: null,
      ScheduleTravelTime: null
    }, schema);

    //Ticket type dropdown
    _this.data.ScheduleTicketTypeCvm = new ComboViewModel({
      selectedValue: _this.data.ScheduleTicketType,
      fields: {
        value: 'TicketTypeID',
        text: 'TicketTypeName',
      },
    });

    //Set appointment date
    _this.data.ScheduleAppointmentDate(_this.date);

    //
    // events
    //

    _this.cmdSaveScheduleTicket = ko.command(function(cb) {

      var TicketId = _this.data.ScheduleTicketID();

      //@TODO
      //if ticketid does not exist, create ticket first to obtain ticketid otherwise proceed to scheduling

      if (!TicketId) {
        createServiceTicket(_this, cb);
      } else {
        setScheduleTicket(_this, cb);
      }


    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(ScheduleTicketViewModel, BaseViewModel);
  ScheduleTicketViewModel.prototype.viewTmpl = 'tmpl-schedule-ticket';
  ScheduleTicketViewModel.prototype.width = 400;
  ScheduleTicketViewModel.prototype.height = 'auto';

  ScheduleTicketViewModel.prototype.onActivate = function( /*routeData*/ ) {

    var _this = this,
      join = joiner();

    //load ticket type list
    load_ticketTypeList(_this.data.ScheduleTicketTypeCvm, join.add());

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  ScheduleTicketViewModel.prototype.getResults = function() {
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

  //create ticket
  function createServiceTicket(_this, cb) {

    var param = {
      AccountID: 1, //temp
      MoniNumber: null, //temp
      TicketTypeID: _this.data.ScheduleTicketType(),
      StatusCodeID: 1, //temp
      MoniConfirmation: 'MONI CONFIRM', //temp
      TechConfirmation: '07/22/2014', //temp
      TechnicianID: 1, //temp
      TripCharges: 123.5, //temp
      Appointment: _this.data.ScheduleAppointmentDate(),
      AgentConfirmation: 'AGENT CONFIRMATION', //temp
      ExpirationDate: '07/22/2014', //temp
      Notes: _this.data.ScheduleTicketNotes(),

    };

    console.log(JSON.stringify("Create Ticket Parameters:" + JSON.stringify(param)));

    dataservice.scheduleenginesrv.SeTicket.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        console.log("Create Ticket:" + JSON.stringify(resp.Value));

        //get TicketID
        _this.data.ScheduleTicketID(resp.Value.TicketID);

        //do scheduling stuff
        setScheduleTicket(_this, cb);

      } else {
        notify.error(err);
      }
    }));

  }

  //do scheduling stuff
  function setScheduleTicket(_this, cb) {

    var param = {
      'BlockId': _this.blockId,
      'Notes': _this.data.ScheduleTicketNotes(),
      'TicketTypeId': _this.data.ScheduleTicketType(),
      'AppointmentDate': _this.data.ScheduleAppointmentDate(),
      'TravelTime': _this.data.ScheduleTravelTime(),
      'TicketId': _this.data.ScheduleTicketID()
    };

    console.log("Data to save:" + JSON.stringify(param));

    dataservice.scheduleenginesrv.SeScheduleTicket.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("SeScheduleTicket:" + JSON.stringify(resp.Value));

        //clear fields
        _this.data.ScheduleTicketID(null);
        _this.data.ScheduleTicketAppointment(null);
        _this.data.ScheduleTicketNotes(null);
        _this.data.ScheduleTicketType(null);
        _this.data.ScheduleTravelTime(null);

      } else {
        notify.error(err);
      }
    }));

  }

  return ScheduleTicketViewModel;
});