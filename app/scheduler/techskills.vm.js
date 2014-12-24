define("src/scheduler/techskills.vm", [
  "src/ukov",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ukov,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema = [ //
    {
      _model: true,
      SkillId: {},
      OtherText: {
        converter: ukov.converters.nullString(),
      },

      checked: {},
      Name: {},
    },
  ];

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

    var skills = fromData(_this.allSkills, _this.techSkills);
    _this.data = ukov.wrap(skills, schema);
    _this.skills = _this.data;

    //
    //events
    //
    _this.toggleSkill = function(vm) {
      vm.checked(!vm.checked());
    };
  }

  utils.inherits(TechSkillsViewModel, BaseViewModel);
  TechSkillsViewModel.prototype.viewTmpl = "tmpl-scheduler-techskills";

  TechSkillsViewModel.prototype.getData = function() {
    var _this = this;
    return toData(_this.data.getValue());
  };
  TechSkillsViewModel.prototype.setData = function(data) {
    var _this = this;
    var skills = fromData(_this.allSkills, data);
    _this.data.setValue(skills);
    _this.data.markClean();
  };

  function fromData(allSkills, techSkills) {
    var techSkillsMap = {};
    techSkills.forEach(function(item) {
      techSkillsMap[item.SkillId] = true;
    });

    return allSkills.map(function(item) {
      return {
        SkillId: item.ID,
        OtherText: item.OtherText || null,
        checked: techSkillsMap[item.ID] || false,
        Name: item.Name,
      };
    });
  }

  function toData(model) {
    var results = [];
    model.forEach(function(item) {
      if (!item.checked) {
        return;
      }
      results.push({
        SkillId: item.SkillId,
        OtherText: item.OtherText,
      });
    });
    return results;
  }

  return TechSkillsViewModel;
});
