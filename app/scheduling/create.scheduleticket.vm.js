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
    AccountId: {},
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

    var ticket = _this.ticket;
    console.log('options' + options);
    //alert(JSON.stringify(ticket));


    //Set title
    _this.title = _this.title || 'Create New Schedule Ticket';

    if (ticket != null) {
      _this.data = ukov.wrap({
        AccountId: ticket.AccountId,
        ScheduleTicketID: ticket.TicketID,
        ScheduleTicketType: ticket.TicketTypeId,
        ScheduleTicketAppointment: null,
        ScheduleTicketNotes: ticket.Notes,
        ScheduleAppointmentDate: null,
        ScheduleTravelTime: null
      }, schema);

    } else {

      _this.data = ukov.wrap({
        AccountId: null,
        ScheduleTicketID: null,
        ScheduleTicketType: null,
        ScheduleTicketAppointment: null,
        ScheduleTicketNotes: null,
        ScheduleAppointmentDate: null,
        ScheduleTravelTime: null
      }, schema);

    }
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

      //account id validation
      dataservice.monitoringstationsrv.accounts.read({
        id: _this.data.AccountId(),
        link: 'Details',
      }, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0 && resp.Value) {

          console.log("Account Details:" + JSON.stringify(resp.Value));

          if (!TicketId) {
            createServiceTicket(_this, cb);
          } else {
            setScheduleTicket(_this, cb);
          }

        } else {
          notify.warn('Account ID is invalid.', null, 3);
        }

      }, notify.error, false));


      //if ticketid does not exist, create ticket first to obtain ticketid otherwise proceed to scheduling

      // if (!TicketId) {
      //   createServiceTicket(_this, cb);
      // } else {
      //   setScheduleTicket(_this, cb);
      // }


    });

    _this.clickClose = function() {
      //_this.layerResult = null;           
      _this.layerResult = _this.ticket;
      closeLayer(_this);
    };


  }

  utils.inherits(ScheduleTicketViewModel, BaseViewModel);
  ScheduleTicketViewModel.prototype.viewTmpl = 'tmpl-schedule-ticket';
  ScheduleTicketViewModel.prototype.width = 400;
  ScheduleTicketViewModel.prototype.height = 'auto';

  ScheduleTicketViewModel.prototype.onActivate = function( /*routeData, extraData, join*/ ) {

    var _this = this,
      join = joiner();
    //console.log('routeData'+routeData);
    //console.log('extra data'+extraData);
    //alert(JSON.stringify(extraData));
    //load ticket type list
    load_ticketTypeList(_this.data.ScheduleTicketTypeCvm, join.add());

  };

  ScheduleTicketViewModel.prototype.onLoad = function(routeData, extraData, join) {

    var _this = this;


    // alert(JSON.stringify(extraData));

    //load ticket type list
    load_ticketTypeList(_this.data.ScheduleTicketTypeCvm, join.add());

  };




  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close(_this.layerResult);
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
      AccountId: _this.data.AccountId(),
      MoniNumber: null, //temp
      TicketTypeId: _this.data.ScheduleTicketType(),
      StatusCodeId: 1, //temp
      MoniConfirmation: 'MONI CONFIRM', //temp
      TechConfirmation: '07/22/2014', //temp
      TechnicianId: 1, //temp
      TripCharges: 123.5, //temp
      Appointment: _this.data.ScheduleAppointmentDate(),
      AgentConfirmation: 'AGENT CONFIRMATION', //temp
      ExpirationDate: '07/22/2014', //temp
      Notes: _this.data.ScheduleTicketNotes(),
      BlockID: _this.blockId,
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

    //check if ticket already scheduled on a block
    dataservice.scheduleenginesrv.SeScheduleTicket.read({
      id: _this.data.ScheduleTicketID(),
      link: 'TID'
    }, null, utils.safeCallback(cb, function(err, resp) {

      console.log("Check ticket if does exist:" + JSON.stringify(resp.Value));

      if (resp.Code === 0 && resp.Value) {
        notify.warn('TicketID:' + _this.data.ScheduleTicketID() + ' was already assigned on a block.', null, 3);
      } else {

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

            _this.data.AccountId(null);
            _this.data.ScheduleTicketID(null);
            _this.data.ScheduleTicketAppointment(null);
            _this.data.ScheduleTicketNotes(null);
            _this.data.ScheduleTicketType(null);
            _this.data.ScheduleTravelTime(null);

            //clear ticket
            if (_this.ticket) {
              _this.ticket = null;
              _this.ticket = _this.ticket = {
                "AccountTicket": "1"
              }; //ticket from accounts added
            } else {
              _this.ticket = _this.ticket = {
                "AccountTicket": "0"
              }; //new ticket added
            }


          } else {
            notify.error(err);
          }
        }));

      }

    }));


    // var param = {
    //   'BlockId': _this.blockId,
    //   'Notes': _this.data.ScheduleTicketNotes(),
    //   'TicketTypeId': _this.data.ScheduleTicketType(),
    //   'AppointmentDate': _this.data.ScheduleAppointmentDate(),
    //   'TravelTime': _this.data.ScheduleTravelTime(),
    //   'TicketId': _this.data.ScheduleTicketID()
    // };

    // console.log("Data to save:" + JSON.stringify(param));

    // dataservice.scheduleenginesrv.SeScheduleTicket.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

    //   if (resp.Code === 0) {

    //     console.log("SeScheduleTicket:" + JSON.stringify(resp.Value));

    //     //clear fields

    //     _this.data.AccountId(null);
    //     _this.data.ScheduleTicketID(null);
    //     _this.data.ScheduleTicketAppointment(null);
    //     _this.data.ScheduleTicketNotes(null);
    //     _this.data.ScheduleTicketType(null);
    //     _this.data.ScheduleTravelTime(null);

    //     //clear ticket
    //     _this.ticket = null;

    //   } else {
    //     notify.error(err);
    //   }
    // }));

  }

  return ScheduleTicketViewModel;
});
