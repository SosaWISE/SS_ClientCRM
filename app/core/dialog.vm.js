define("src/core/dialog.vm", [
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ko,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function DialogViewModel(options) {
    var _this = this;
    DialogViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ["title", "msg", "actionNames"]);

    //
    // add events/actions
    //
    _this.actions = [];
    _this.actionNames.forEach(function(name) {
      _this.actions.push({
        name: name.substr(0, 1).toUpperCase() + name.substr(1),
        action: function() {
          _this.layerResult = name;
          closeLayer(_this);
        },
      });
    });
  }
  utils.inherits(DialogViewModel, BaseViewModel);
  DialogViewModel.prototype.viewTmpl = "tmpl-core-dialog";
  DialogViewModel.prototype.width = 600;
  DialogViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  DialogViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return DialogViewModel;
});
