define("src/account/security/telguard.vm", [
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function TelguardViewModel(options) {
    var _this = this;
    TelguardViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["layersVm"]);

    //
    // events
    //
    _this.cmd = ko.command(function(cb) {
      cb();
    });
  }
  utils.inherits(TelguardViewModel, ControllerViewModel);
  TelguardViewModel.prototype.viewTmpl = "tmpl-security-telguard";

  TelguardViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this,
    join.add()();
  };

  return TelguardViewModel;
});
