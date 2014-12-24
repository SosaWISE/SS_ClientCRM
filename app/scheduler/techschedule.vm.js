define("src/scheduler/techschedule.vm", [
  "moment",
  "src/ukov",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  moment,
  ukov,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function getStartDate() {
    return _startDate;
  }
  var _startDate = new Date(1970, 0);

  function removeSeconds(dt) {
    dt.setSeconds(0, 0);
    return dt;
  }

  var timeGroup = {
    keys: ["StartTime", "EndTime"],
    validators: [

      function(val) {
        if (val.EndTime.valueOf() <= val.StartTime.valueOf()) {
          return "End Time must be greater than Start Time";
        }
      }
    ],
  };
  var schema = [ //
    {
      _model: true,
      day: {},
      checked: {},
      DayId: {},
      StartTime: {
        converter: ukov.converters.time(getStartDate, removeSeconds),
        validators: [
          ukov.validators.isRequired("Start Time is required"),
        ],
        validationGroup: timeGroup,
      },
      EndTime: {
        converter: ukov.converters.time(getStartDate, removeSeconds),
        validators: [
          ukov.validators.isRequired("End Time is required"),
        ],
        validationGroup: timeGroup,
      },
    },
  ];

  //
  //
  //
  function TechScheduleViewModel(options) {
    var _this = this;
    TechScheduleViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "techDays",
    ]);
    utils.setIfNull(_this, {

    });

    _this.data = ukov.wrap(fromData(_this.techDays), schema);
    _this.weekDays = _this.data;

    _this.data.peek().forEach(function(day) {
      day.checked.subscribe(function(checked) {
        // this.ignore(!checked);
        this.StartTime.ignore(!checked);
        this.EndTime.ignore(!checked);
      }, day);
    });
    setChecked(_this);
    _this.data.markClean();

    //
    //events
    //
    _this.toggleWeekDay = function(vm) {
      vm.checked(!vm.checked());
    };
  }

  utils.inherits(TechScheduleViewModel, BaseViewModel);
  TechScheduleViewModel.prototype.viewTmpl = "tmpl-scheduler-techschedule";

  TechScheduleViewModel.prototype.getData = function() {
    var _this = this;
    return toData(_this.data.getValue());
  };
  TechScheduleViewModel.prototype.setData = function(data) {
    var _this = this;
    _this.data.setValue(fromData(data));
    setChecked(_this);
    _this.data.markClean();
  };

  function fromData(techDays) {
    var techDaysMap = {};
    techDays.forEach(function(item) {
      techDaysMap[item.DayId] = item;
    });

    var i = 7;
    var d = moment();
    var weekDays = new Array(i);
    while (i--) {
      var item = techDaysMap[i] || {};
      weekDays[i] = {
        day: d.weekday(i).format("dddd"),
        checked: true, //!!item.StartTime,
        DayId: i,
        StartTime: item.StartTime || null,
        EndTime: item.EndTime || null,
      };
    }
    return weekDays;
  }

  function toData(model) {
    var results = [];
    model.forEach(function(item) {
      if (!item.checked) {
        return;
      }
      results.push({
        DayId: item.DayId,
        StartTime: item.StartTime || null,
        EndTime: item.EndTime || null,
      });
    });
    return results;
  }

  function setChecked(_this) {
    _this.data.peek().forEach(function(day) {
      day.checked(!!day.model.StartTime);
    });
  }

  return TechScheduleViewModel;
});
