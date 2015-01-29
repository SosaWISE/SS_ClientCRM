define("src/scheduler/techs.vm", [
  "src/scheduler/scheduler-cache",
  "src/scheduler/tech.setup.vm",
  "moment",
  "jquery",
  "ko",
  "src/dataservice",
  "src/ukov",
  "src/core/joiner",
  "src/core/combo.vm",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  schedulercache,
  TechSetupViewModel,
  moment,
  jquery,
  ko,
  dataservice,
  ukov,
  joiner,
  ComboViewModel,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  //
  //
  //
  function TechsViewModel(options) {
    var _this = this;
    TechsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      // "layersVm",
    ]);
    utils.setIfNull(_this, {

    });

    _this.techVm = ko.observable();
    _this.techsCvm = new ComboViewModel({
      fields: {
        value: "RecruitId",
        text: function(item) {
          return strings.format("{0} ({1} - R{2} - {3})",
            item.FullName, item.GPEmployeeID, item.RecruitId, item.SeasonName);
        },
      },
    });
    _this.techsCvm.selected.subscribe(function(selected) {
      if (!selected || selected === _this.techsCvm.noItemSelected) {
        return;
      }
      var vm = selected.vm;
      if (!vm) {
        selected.vm = vm = new TechSetupViewModel({
          item: utils.clone(selected.item),
          allSkills: schedulercache.getList("skills").peek(),
        });
        vm.load(); //{}, {});
      }
      _this.techVm(vm);
    });
  }

  utils.inherits(TechsViewModel, ControllerViewModel);
  TechsViewModel.prototype.viewTmpl = "tmpl-scheduler-techs";

  //
  // members
  //

  TechsViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;

    schedulercache.ensure("skills", join.add());
    schedulercache.ensure("techs", join.add());

    join.when(function(err) {
      if (err) {
        return;
      }

      var techs = utils.clone(schedulercache.getList("techs").peek());
      // //@HACK: for GPEmployeeIDs with trailing spaces
      // techs.forEach(function(tech) {
      //   tech.GPEmployeeID = strings.trim(tech.GPEmployeeID);
      // });
      _this.techsCvm.setList(techs);
    });
  };


  return TechsViewModel;
});
