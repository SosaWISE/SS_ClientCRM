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

  function getStartDate(model) {
    return model._startDate;
  }
  var schema = {
    _model: true,
    TicketID: {},

    StartTime: {
      converter: ukov.converters.time(getStartDate),
      validators: [
        ukov.validators.isRequired("Start Time is required"),
      ],
    },
    EndTime: {
      converter: ukov.converters.time(getStartDate),
      validators: [
        ukov.validators.isRequired("Start Time is required"),
      ],
    },

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

    var startDate = new Date(_this.item.StartTime.valueOf());
    _this.item._startDate = startDate;
    _this.startDateText = strings.format("{0:d}", startDate);

    function setupDate(dt) {
      // ensure date has the same date as start tIme
      dt.setFullYear(startDate.getFullYear());
      dt.setMonth(startDate.getMonth());
      dt.setDate(startDate.getDate());
      // remove seconds and milliseconds
      dt.setSeconds(0);
    }
    setupDate(_this.item.StartTime);
    setupDate(_this.item.EndTime);

    _this.data = ukov.wrap(_this.item, schema);

    _this.position = ko.computed({
      deferEvaluation: true,
      read: function() {
        _this.data.StartTime(); // subscribe
        var row = timeToRow(_this.startHour, _this.data.model.StartTime);
        return {
          top: row * rowHeight,
          left: "0px",
        };
      },
      write: function(position) {
        // convert from screen position to time
        var row = Math.floor(position.top / rowHeight);
        var timeTicks = rowToTicks(_this.startHour, row);
        // clone date values that will be changed
        var startTime = new Date(_this.data.model.StartTime.valueOf());
        var endTime = new Date(_this.data.model.EndTime.valueOf());
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
        _this.data.StartTime(); // subscribe
        _this.data.EndTime(); // subscribe
        var row = timeToRow(_this.startHour, _this.data.model.StartTime);
        var nRows = timeToRow(_this.startHour, _this.data.model.EndTime, _this.endHour) - row;
        return Math.max(5, nRows * rowHeight);
      },
      write: function(height) {
        var nRows = height / rowHeight;
        var startTime = _this.data.model.StartTime;
        var row = timeToRow(_this.startHour, startTime);
        var timeTicks = rowToTicks(_this.startHour, nRows + row);
        // clone date values that will be changed
        var endTime = new Date(_this.data.model.EndTime.valueOf());

        endTime.setHours(0, 0, 0, 0); // remove time from date
        endTime = new Date(endTime.valueOf() + timeTicks);
        _this.data.EndTime(endTime);
      },
    });

    _this.timespan = ko.computed(function() {
      var data = _this.data;
      var model = data.model;
      data.StartTime(); // subscribe
      data.EndTime(); // subscribe
      return strings.format("{0:t} - {1:t}", model.StartTime, model.EndTime);
    });


    _this.selected = ko.observable(false);


    //
    //events
    //
    _this.clickCancel = function() {
      // reset data
      _this.data.reset();
      //
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
    if (utils.isDate(dt)) {
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
