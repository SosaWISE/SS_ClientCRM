define("src/scheduler/techschedule.vm", [
  "moment",
  "ko",
  "src/ukov",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  moment,
  ko,
  ukov,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function getStartDate() {
    return _startDate;
  }
  var _startDate = new Date(0);

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

    var techDaysMap = {};
    _this.techDays.forEach(function(item) {
      techDaysMap[item.DayId] = item;
    });

    var i = 7;
    var d = moment();
    var weekDays = new Array(i);
    while (i--) {
      var techDay = techDaysMap[i] || {};
      weekDays[i] = {
        day: d.weekday(i).format("dddd"),
        checked: true, //!!techDay.StartTime,
        StartTime: techDay.StartTime || null,
        EndTime: techDay.EndTime || null,
      };
    }
    _this.weekDays = ukov.wrap(weekDays, schema);
    _this.weekDays.peek().forEach(function(day) {
      day.checked.subscribe(function(checked) {
        // this.ignore(!checked);
        this.StartTime.ignore(!checked);
        this.EndTime.ignore(!checked);
      }, day);
      day.checked(!!day.model.StartTime);
    });

    //
    //events
    //
    _this.toggleWeekDay = function(vm) {
      vm.checked(!vm.checked());
    };
  }

  utils.inherits(TechScheduleViewModel, BaseViewModel);
  TechScheduleViewModel.prototype.viewTmpl = "tmpl-scheduler-techschedule";

  return TechScheduleViewModel;
});
