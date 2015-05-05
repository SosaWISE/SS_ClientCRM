define("src/account/security/alarmnet.editor.vm", [
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function AlarmNetEditorViewModel(options) {
    var _this = this;
    AlarmNetEditorViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["layersVm"]);

    //
    // events
    //
    _this.cmd = ko.command(function(cb) {
      cb();
    });
  }
  utils.inherits(AlarmNetEditorViewModel, ControllerViewModel);
  AlarmNetEditorViewModel.prototype.viewTmpl = "tmpl-security-alarmnet_editor";

  AlarmNetEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this,
    var cb = join.add();
    window.window.setTimeout(function() {
      //@TODO: load real data

      cb();
    }, 2000);
  };

  return AlarmNetEditorViewModel;
});
