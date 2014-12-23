define("src/scheduler/tech.vm", [
  "src/hr/hr-cache",
  "src/scheduler/techschedule.vm",
  "src/scheduler/techskills.vm",
  "moment",
  "jquery",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  hrcache,
  TechScheduleViewModel,
  TechSkillsViewModel,
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

    _this.scheduleVm = ko.observable();
    _this.skillsVm = ko.observable();
  }

  utils.inherits(TechViewModel, ControllerViewModel);
  TechViewModel.prototype.viewTmpl = "tmpl-scheduler-tech";

  //
  // members
  //

  TechViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;

    hrcache.ensure("skills", join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.scheduleVm(new TechScheduleViewModel({
        techDays: [ //
          {
            DayId: 0,
          }, {
            DayId: 1,
            StartTime: new Date(1970, 0, 1, 6),
            EndTime: new Date(1970, 0, 1, 17),
          }, {
            DayId: 2,
            StartTime: new Date(1970, 0, 1, 6),
            EndTime: new Date(1970, 0, 1, 17),
          }, {
            DayId: 3,
            StartTime: new Date(1970, 0, 1, 6),
            EndTime: new Date(1970, 0, 1, 17),
          }, {
            DayId: 4,
            StartTime: new Date(1970, 0, 1, 6),
            EndTime: new Date(1970, 0, 1, 17),
          }, {
            DayId: 5,
            StartTime: new Date(1970, 0, 1, 6),
            EndTime: new Date(1970, 0, 1, 17),
          }, {
            DayId: 6,
          },
        ],
      }));
      _this.skillsVm(new TechSkillsViewModel({
        allSkills: hrcache.getList("skills").peek(),
        techSkills: [ //
          {
            SkillId: 1,
          }, {
            SkillId: 3,
          }, {
            SkillId: 5,
          }, {
            SkillId: 8,
          },
        ],
      }));
    });
  };

  return TechViewModel;
});
