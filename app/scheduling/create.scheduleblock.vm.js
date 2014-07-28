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

      var block,
        param;

      //check am/pm
      block = (parseInt(_this.data.ScheduleEndTime(), 10) < 12) ? 'AM' : 'PM';

      console.log("Block:" + block);

      param = {
        'Block': block,
        'ZipCode': _this.data.ScheduleZip(),
        'MaxRadius': _this.data.ScheduleMaxRadius(),
        'Distance': _this.data.ScheduleDistance(),
        'StartTime': _this.data.ScheduleStartTime(),
        'EndTime': _this.data.ScheduleEndTime(),
        'AvailableSlots': 10, //temp
        'TechnicianId': 1,
      };

      console.log("Data to save:" + JSON.stringify(param));

      //@TODO Save block

      dataservice.scheduleenginesrv.SeScheduleBlock.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {
          console.log("SeScheduleBlock:" + JSON.stringify(resp.Value));

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
