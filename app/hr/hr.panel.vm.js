define("src/hr/hr.panel.vm", [
  "src/hr/teams.vm",
  "src/hr/users.vm",
  "ko",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  TeamsViewModel,
  UsersViewModel,
  ko,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function HrPanelViewModel(options) {
    var _this = this;
    HrPanelViewModel.super_.call(_this, options);

    _this.showNav = ko.observable(true); // && config.hr.showNav);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(HrPanelViewModel, ControllerViewModel);

  HrPanelViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.childs([ //
      new TeamsViewModel({
        pcontroller: _this,
        id: "teams",
        title: "Teams",
        layersVm: _this.layersVm,
      }),
      _this.defaultChild = new UsersViewModel({
        pcontroller: _this,
        id: "users",
        title: "Users",
        layersVm: _this.layersVm,
      }),
    ]);
  };

  return HrPanelViewModel;
});
