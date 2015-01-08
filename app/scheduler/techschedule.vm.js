define("src/scheduler/techschedule.vm", [
  "moment",
  "src/dataservice",
  "ko",
  "src/ukov",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  moment,
  dataservice,
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
      Version: {},
      WeekDay: {},
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
      "editing",
    ]);
    _this.mixinLoad();

    var i = 7;
    var d = moment();
    var weekdays = new Array(i);
    while (i--) {
      weekdays[i] = {
        day: d.weekday(i).format("dddd"),
        checked: true,
        WeekDay: i,
        StartTime: null,
        EndTime: null,
      };
    }
    _this.data = ukov.wrap(weekdays, schema);
    _this.weekdays = _this.data;

    _this.data.peek().forEach(function(day) {
      day.checked.subscribe(function(checked) {
        // this.ignore(!checked);
        this.StartTime.ignore(!checked);
        this.EndTime.ignore(!checked);
        this.update();
      }, day);
    });
    setChecked(_this);
    _this.data.markClean();

    _this.viewTmpl = ko.computed(function() {
      if (_this.editing()) {
        return "tmpl-scheduler-techschedule_editor";
      } else {
        return "tmpl-scheduler-techschedule";
      }
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

  TechScheduleViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;

    _this.techid = routeData.techid;

    if (!_this.techid) {
      return;
    }
    dataservice.ticketsrv.techs.read({
      id: _this.techid,
      link: "weekdays",
    }, function(weekdays) {
      _this.setData(weekdays);
    }, join.add());
  };

  TechScheduleViewModel.prototype.getData = function() {
    var _this = this;
    return toData(_this.data.getValue());
  };
  TechScheduleViewModel.prototype.setData = function(data) {
    var _this = this;
    // create lookup
    var techDaysMap = {};
    data.forEach(function(item) {
      techDaysMap[item.WeekDay] = item;
    });
    // set values
    _this.data().forEach(function(item) {
      var weekday = item.model.WeekDay;
      var techDay = techDaysMap[weekday];
      if (techDay) {
        techDay.checked = true;
      } else {
        techDay = {
          checked: false,
          WeekDay: weekday,
          StartTime: null,
          EndTime: null,
        };
      }
      item.setValue(techDay);
    });
    //
    setChecked(_this);
    //
    _this.data.markClean();
  };
  TechScheduleViewModel.prototype.saveData = function(cb) {
    var _this = this;
    var data = _this.getData();
    dataservice.ticketsrv.techs.save({
      id: _this.techid || 0,
      link: "weekdays",
      data: data,
    }, function(val) {
      _this.setData(val);
    }, cb);
  };

  function toData(model) {
    var results = [];
    model.forEach(function(item) {
      if (!item.checked) {
        return;
      }
      results.push({
        Version: item.Version,
        WeekDay: item.WeekDay,
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
