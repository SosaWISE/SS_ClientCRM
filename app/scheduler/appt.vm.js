define("src/scheduler/appt.vm", [
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ko,
  ukov,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var rowHeight = 7; //

  // var nullStrConverter = ukov.converters.nullString();
  var schema = {
    _model: true,
    TicketID: {},

    StartTime: {},
    EndTime: {},

    AccountId: {
      converter: ukov.converters.number(0),
    },
    TicketTypeId: {},
    MonitoringStationNo: {},
    StatusCodeId: {},
    MoniConfirmation: {},
    TechConfirmation: {},
    TechnicianId: {},
    TripCharges: {},
    Appointment: {},
    AgentConfirmation: {},
    ExpirationDate: {},
    Notes: {},
  };

  function ApptViewModel(options) {
    var _this = this;
    ApptViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "item",
      "startHour",
      "endHour",
    ]);
    BaseViewModel.ensureProps(_this.item, [
      "StartTime",
      "EndTime",
    ]);

    _this.item = _this.item || {};
    _this.data = ukov.wrap(_this.item, schema);

    _this.position = ko.computed({
      deferEvaluation: true,
      read: function() {
        var row = timeToRow(_this.startHour, _this.data.StartTime());
        return {
          top: row * rowHeight,
          left: "0px",
        };
      },
      write: function(position) {
        // convert from screen position to time
        var row = Math.floor(position.top / rowHeight);
        var timeTicks = rowToTicks(_this.startHour, row);
        //
        var startTime = _this.data.StartTime.peek();
        var endTime = _this.data.EndTime.peek();
        // ensure end tIme has the same date as start tIme
        endTime.setFullYear(startTime.getFullYear());
        endTime.setMonth(startTime.getMonth());
        endTime.setDate(startTime.getDate());
        // find delta between StartTime and EndTime
        var delta = endTime.valueOf() - startTime.valueOf();

        startTime.setHours(0, 0, 0, 0); // remove time from date
        startTime = new Date(startTime.valueOf() + timeTicks);
        _this.data.StartTime(startTime);
        endTime = new Date(startTime.valueOf() + delta);
        _this.data.EndTime(endTime);
      },
    });
    _this.height = ko.computed({
      deferEvaluation: true,
      read: function() {
        var row = timeToRow(_this.startHour, _this.data.StartTime());
        var nRows = timeToRow(_this.startHour, _this.data.EndTime(), _this.endHour) - row;
        return Math.max(5, nRows * rowHeight);
      },
      write: function(height) {
        var nRows = height / rowHeight;
        var row = timeToRow(_this.startHour, _this.data.StartTime.peek());
        var timeTicks = rowToTicks(_this.startHour, nRows + row);
        //
        var startTime = _this.data.StartTime.peek();
        var endTime = _this.data.EndTime.peek();
        // ensure end tIme has the same date as start tIme
        endTime.setFullYear(startTime.getFullYear());
        endTime.setMonth(startTime.getMonth());
        endTime.setDate(startTime.getDate());

        endTime.setHours(0, 0, 0, 0); // remove time from date
        endTime = new Date(endTime.valueOf() + timeTicks);
        _this.data.EndTime(endTime);
      },
    });

    _this.timespan = ko.computed(function() {
      var data = _this.data;
      var formatTime = strings.formatters.time;
      return formatTime(data.StartTime()) + " - " + formatTime(data.EndTime());
    });

    _this.selected = ko.observable(false);


    //
    //events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
  }
  utils.inherits(ApptViewModel, BaseViewModel);
  ApptViewModel.prototype.viewTmpl = "tmpl-scheduler-appt-editor";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }

  // ApptViewModel.prototype.getResults = function() {
  //   var _this = this;
  //   return [_this.layerResult];
  // };
  // ApptViewModel.prototype.closeMsg = function() { // overrides base
  //   var _this = this,
  //     msg;
  //   if (!_this.layerResult &&
  //     (
  //       (_this.cmdSave && _this.cmdSave.busy()) ||
  //       (_this.cmdSchedule && _this.cmdSchedule.busy())
  //     )) {
  //     msg = "Please wait for save to finish.";
  //   }
  //   return msg;
  // };



  ApptViewModel.rowHeight = rowHeight;

  function timeToRow(startHour, dt, endHour) {
    var hours, minutes = 0;
    if (dt) {
      hours = dt.getHours();
      minutes = dt.getMinutes();
    } else {
      hours = (endHour) ? endHour : startHour;
    }
    // only uses hours and minutes
    // one row for every 5 minute period
    return ((hours - startHour) * 12) + Math.floor(minutes / 5);
  }
  ApptViewModel.timeToRow = timeToRow; // expose for specs

  function rowToTicks(startHour, row) {
    row = Math.floor(row);
    var div = (row / 12);
    var hours = Math.floor(div);
    var minutes = Math.round((div - hours) * 60);
    return ((hours + startHour) * 3600000) + (minutes * 60000);
  }
  ApptViewModel.rowToTicks = rowToTicks; // expose for specs

  function toCalendarItem(editable, item, startHour, endHour) {
    if (editable) {
      return new ApptViewModel({
        item: item,
        startHour: startHour,
        endHour: endHour,
      });
    }

    var row = timeToRow(startHour, item.StartTime);
    var nRows = timeToRow(startHour, item.EndTime, endHour) - row;
    return {
      selected: ko.observable(false),
      item: item,
      position: {
        top: row * rowHeight,
        left: "0px",
      },
      height: Math.max(5, nRows * rowHeight),
    };
  }
  ApptViewModel.toCalendarItem = toCalendarItem;

  return ApptViewModel;
});
