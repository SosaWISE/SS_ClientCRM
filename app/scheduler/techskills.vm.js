define("src/scheduler/techskills.vm", [
  "ko",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ko,
  utils,
  BaseViewModel
) {
  "use strict";

  //
  //
  //
  function TechSkillsViewModel(options) {
    var _this = this;
    TechSkillsViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "allSkills",
      "techSkills",
    ]);
    utils.setIfNull(_this, {

    });

    var techSkillsMap = {};
    _this.techSkills.forEach(function(item) {
      techSkillsMap[item.SkillId] = true;
    });

    _this.skills = _this.allSkills.map(function(item) {
      return {
        SkillId: item.ID,
        Name: item.Name,
        checked: ko.observable(techSkillsMap[item.ID]),
      };
    });

    //
    //events
    //
    _this.toggleSkill = function(vm) {
      vm.checked(!vm.checked());
    };
  }

  utils.inherits(TechSkillsViewModel, BaseViewModel);
  TechSkillsViewModel.prototype.viewTmpl = "tmpl-scheduler-techskills";

  //
  // members
  //

  return TechSkillsViewModel;
});
