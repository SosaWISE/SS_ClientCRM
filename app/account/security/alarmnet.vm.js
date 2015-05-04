define("src/account/security/alarmnet.vm", [
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function AlarmNetViewModel(options) {
    var _this = this;
    AlarmNetViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["layersVm"]);

    //
    // events
    //
    _this.cmd = ko.command(function(cb) {
      cb();
    });
  }
  utils.inherits(AlarmNetViewModel, ControllerViewModel);
  AlarmNetViewModel.prototype.viewTmpl = "tmpl-security-alarmnet";

  AlarmNetViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this,
    var cb = join.add();
    window.setTimeout(function() {
      //@TODO: load real data

      cb();
    }, 2000);
  };

  return AlarmNetViewModel;
});
