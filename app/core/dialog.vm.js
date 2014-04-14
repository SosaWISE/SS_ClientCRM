define('src/core/dialog.vm', [
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
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
    BaseViewModel.ensureProps(_this, ['title', 'msg', 'actionNames']);

    function closeLayer(result) {
      if (_this.layer) {
        _this.layer.close(result);
      }
    }

    //
    // add events/actions
    //
    _this.actions = [];
    _this.actionNames.forEach(function(name) {
      _this.actions.push({
        name: name.substr(0, 1).toUpperCase() + name.substr(1),
        action: function() {
          closeLayer(name);
        },
      });
    });
  }
  utils.inherits(DialogViewModel, BaseViewModel);
  DialogViewModel.prototype.viewTmpl = 'tmpl-dialog';
  DialogViewModel.prototype.width = 600;
  DialogViewModel.prototype.height = 'auto';

  return DialogViewModel;
});
