define("src/scheduler/tech.vm", [
  "moment",
  "jquery",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  moment,
  jquery,
  ko,
  ukov,
  strings,
  notify,
  utils,
  ControllerViewModel
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
  function TechViewModel(options) {
    var _this = this;
    TechViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      // "layersVm",
    ]);
    utils.setIfNull(_this, {

    });

    _this.skills = ko.observableArray();

    var i = 7;
    var d = moment();
    var weekDays = new Array(i);
    while (i--) {
      weekDays[i] = {
        day: d.weekday(i).format("dddd"),
        checked: true,
        StartTime: null,
        EndTime: null,
      };
    }
    _this.weekDays = ukov.wrap(weekDays, schema);
    _this.weekDays.peek().forEach(function(day) {
      day.checked.subscribe(function(checked) {
        this.ignore(!checked);
      }, day);
    });


    //
    //events
    //
    _this.toggleWeekDay = function(vm) {
      vm.checked(!vm.checked());
    };
    _this.toggleSkill = function(vm) {
      vm.checked(!vm.checked());
    };
  }

  utils.inherits(TechViewModel, ControllerViewModel);
  TechViewModel.prototype.viewTmpl = "tmpl-scheduler-tech";

  //
  // members
  //

  TechViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    var cb = join.add();

    var allSkills = [];
    for (var i = 0; i < 10; i++) {
      allSkills.push({
        ID: i + 1,
        Name: "Skill " + (i + 1),
      });
    }

    var techSkills = [ //
      {
        TechId: 1,
        SkillId: 1,
      }, {
        TechId: 1,
        SkillId: 3,
      }, {
        TechId: 1,
        SkillId: 5,
      }, {
        TechId: 1,
        SkillId: 8,
      },
    ];

    setTimeout(function() {
      cb();
    }, 500);

    join.when(function(err) {
      if (err) {
        return;
      }

      var techSkillsMap = {};
      techSkills.forEach(function(item) {
        techSkillsMap[item.SkillId] = true;
      });

      var v = allSkills.map(function(item) {
        return {
          SkillId: item.ID,
          Name: item.Name,
          checked: ko.observable(techSkillsMap[item.ID]),
        };
      });
      _this.skills(v);
    });
  };

  return TechViewModel;
});
