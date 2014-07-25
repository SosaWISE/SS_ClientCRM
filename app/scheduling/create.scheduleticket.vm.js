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

      var param = {
        'BlockId': 1, //temp        
        'Appointment': _this.data.ScheduleTicketAppointment(),
        'Notes': _this.data.ScheduleTicketNotes(),
        'TicketTypeId': _this.data.ScheduleTicketType(),
        'AppointmentDate': _this.data.ScheduleAppointmentDate(),
        'TravelTime': _this.data.ScheduleTravelTime(),
        'TicketId': 8 //temp  

      };

      console.log("Data to save:" + JSON.stringify(param));

      //@TODO save schedule ticket      

      dataservice.scheduleenginesrv.SeScheduleTicket.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {
          console.log("SeScheduleTicket:" + JSON.stringify(resp.Value));

          notify.info("Ticket saved", null, 3);

          //close popup
          closeLayer(_this);

        } else {
          notify.error(err);
        }
      }));

      cb();

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

  return ScheduleTicketViewModel;
});
