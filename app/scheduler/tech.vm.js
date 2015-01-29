define("src/scheduler/tech.vm", [
  "src/scheduler/scheduler-cache",
  "src/scheduler/tech.setup.vm",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  schedulercache,
  TechSetupViewModel,
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
      "item",
    ]);

    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(TechViewModel, ControllerViewModel);
  TechViewModel.prototype.viewTmpl = "tmpl-scheduler-tech";

  //
  // members
  //

  TechViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;

    schedulercache.ensure("skills", join.add());

    join.when(function(err) {
      if (err) {
        return;
      }

      _this.childs([
        new TechSetupViewModel({
          pcontroller: _this,
          id: "setup",
          title: "Tech Setup",
          item: utils.clone(_this.item),
          allSkills: schedulercache.getList("skills").peek(),
        }),
      ]);
    });
  };


  return TechViewModel;
});
