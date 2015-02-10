define("src/scheduler/techskills.vm", [
  "src/scheduler/scheduler-cache",
  "src/dataservice",
  "ko",
  "src/ukov",
  "src/core/utils",
  "src/core/base.vm",
], function(
  schedulercache,
  dataservice,
  ko,
  ukov,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema = [ //
    {
      _model: true,
      SkillId: {},
      Other: {
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
      "editing",
      "allSkills",
    ]);
    _this.mixinLoad();

    var skills = _this.allSkills.map(function(item) {
      return {
        checked: false,
        SkillId: item.ID,
        Name: item.Name,
        Other: null,
      };
    });
    _this.data = ukov.wrap(skills, schema);
    _this.skills = _this.data;

    _this.viewTmpl = ko.computed(function() {
      if (_this.editing()) {
        return "tmpl-scheduler-techskills_editor";
      } else {
        return "tmpl-scheduler-techskills";
      }
    });

    //
    //events
    //
    _this.toggleSkill = function(vm) {
      vm.checked(!vm.checked());
    };
  }

  utils.inherits(TechSkillsViewModel, BaseViewModel);
  // TechSkillsViewModel.prototype.viewTmpl = "tmpl-scheduler-techskills";

  TechSkillsViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;

    _this.techid = routeData.id;

    if (!_this.techid) {
      return;
    }
    dataservice.ticketsrv.techs.read({
      id: _this.techid,
      link: "skills",
    }, function(skills) {
      _this.setData(skills);
    }, join.add());
  };

  TechSkillsViewModel.prototype.getData = function() {
    var _this = this;
    return toData(_this.data.getValue());
  };
  TechSkillsViewModel.prototype.setData = function(data) {
    var _this = this;
    // create lookup
    var skillsMap = {};
    data.forEach(function(item) {
      skillsMap[item.SkillId] = item;
    });
    // set values
    _this.data().forEach(function(item) {
      var skillId = item.model.SkillId;
      var skill = skillsMap[skillId];
      if (skill) {
        skill.checked = true;
      } else {
        skill = {
          checked: false,
          SkillId: skillId,
          Other: null,
        };
      }
      item.setValue(skill);
    });
    //
    _this.data.markClean();
  };
  TechSkillsViewModel.prototype.saveData = function(cb) {
    var _this = this;
    var data = _this.getData();
    dataservice.ticketsrv.techs.save({
      id: _this.techid || 0,
      link: "skills",
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
        SkillId: item.SkillId,
        Other: item.Other,
      });
    });
    return results;
  }

  return TechSkillsViewModel;
});
