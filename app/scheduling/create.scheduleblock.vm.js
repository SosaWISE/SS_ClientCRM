define('src/scheduling/create.scheduleblock.vm', [
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


  function ScheduleBlockViewModel(options) {
    var _this = this;
    ScheduleBlockViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Create Schedule Block';

    _this.data = ukov.wrap(_this.item || {
      ScheduleZip: null,
      ScheduleMaxRadius: null,
      ScheduleDistance: null,
      ScheduleDate: null,
      ScheduleStartTime: null,
      ScheduleEndTime: null
    }, schema);

    //Set values
    _this.data.ScheduleDate(_this.date);
    _this.data.ScheduleStartTime(_this.stime);
    _this.data.ScheduleEndTime(_this.etime);

    //
    // events
    //

    _this.cmdSaveBlock = ko.command(function(cb) {

      var param = {
        'Title': null, //temp
        'AppointmentDate': _this.data.ScheduleDate(),
        'AppointmentDuration': 100, //temp
        'TravelTime': 0, //temp
        'TicketId': 8 //temp                            
      };

      console.log("Ready to save block...");
      console.log("Data to save:" + JSON.stringify(param));

      //@TODO Save block
      alert("@TODO Save block");

      // dataservice.scheduleenginesrv.SeScheduleTicket.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      //   if (resp.Code === 0) {
      //     console.log("SeScheduleTicket:" + JSON.stringify(resp.Value));

      //     notify.info("Ticket saved", null, 3);

      //     //close popup
      //     closeLayer(_this);

      //   } else {
      //     notify.error(err);
      //   }
      // }));

      cb();

    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(ScheduleBlockViewModel, BaseViewModel);
  ScheduleBlockViewModel.prototype.viewTmpl = 'tmpl-schedule-block';
  ScheduleBlockViewModel.prototype.width = 400;
  ScheduleBlockViewModel.prototype.height = 'auto';

  ScheduleBlockViewModel.prototype.onActivate = function( /*routeData*/ ) {};

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  ScheduleBlockViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return ScheduleBlockViewModel;
});
