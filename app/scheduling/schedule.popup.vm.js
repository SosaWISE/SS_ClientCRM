define('src/scheduling/schedule.popup.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  $,
  fullCalendar,
  dataservice,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    ScheduleZip: {},
    ScheduleMaxRadius: {},
    ScheduleDistance: {},
    ScheduleDate: {},
    ScheduleStartTime: {},
    ScheduleEndTime: {}
  };


  function SchedulePopupViewModel(options) {
    var _this = this;
    SchedulePopupViewModel.super_.call(_this, options);

    //debugging
    console.log("Title:" + _this.ptitle);
    console.log("Date:" + _this.pdate);
    console.log("Time:" + _this.ptime);


    //Set title
    _this.title = _this.title || 'Create New Service Ticket';

    _this.data = ukov.wrap(_this.item || {
      ScheduleZip: null,
      ScheduleMaxRadius: null,
      ScheduleDistance: null,
      ScheduleDate: null,
      ScheduleStartTime: null,
      ScheduleEndTime: null
    }, schema);

    //Set values
    _this.data.ScheduleDate(_this.pdate);
    _this.data.ScheduleStartTime(_this.stime);
    _this.data.ScheduleEndTime(_this.etime);

    //
    // events
    //

    _this.cmdSaveEvent = ko.command(function(cb) {

      var dataRow = {
        'Title': null, //temp
        'AppointmentDate': _this.data.ScheduleDate(),
        'AppointmentDuration': 100, //temp
        'TravelTime': 0, //temp
        'TicketId': 8 //temp                            
      };

      console.log("Ready to save event...");
      console.log("Data to save:" + JSON.stringify(dataRow));

      dataservice.scheduleenginesrv.SeScheduleTicket.post(null, dataRow, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {
          console.log("SeScheduleTicket:" + JSON.stringify(resp.Value));

          notify.info("Ticket saved", null, 3);

          //close popup
          closeLayer(_this);

        } else {
          notify.error(err);
        }
      }));

    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(SchedulePopupViewModel, BaseViewModel);
  SchedulePopupViewModel.prototype.viewTmpl = 'tmpl-schedule-popup';
  SchedulePopupViewModel.prototype.width = 400;
  SchedulePopupViewModel.prototype.height = 'auto';

  SchedulePopupViewModel.prototype.onActivate = function( /*routeData*/ ) {};

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  SchedulePopupViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return SchedulePopupViewModel;
});
