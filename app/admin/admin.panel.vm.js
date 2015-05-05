define("src/admin/admin.panel.vm", [
  "src/admin/authcontrol.vm",
  "ko",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  AuthControlViewModel,
  ko,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function AdminPanelViewModel(options) {
    var _this = this;
    AdminPanelViewModel.super_.call(_this, options);

    _this.showNav = ko.observable(true); // && config.admin.showNav);

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
  utils.inherits(AdminPanelViewModel, ControllerViewModel);

  AdminPanelViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.childs([ //
      new AuthControlViewModel({
        pcontroller: _this,
        id: "authcontrol",
        title: "Auth Control",
        layersVm: _this.layersVm,
      }),
    ]);
  };

  return AdminPanelViewModel;
});
