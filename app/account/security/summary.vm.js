define('src/account/security/summary.vm', [
  'src/account/security/emcontacts.vm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  EmContactsViewModel,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SummaryViewModel(options) {
    var _this = this;
    SummaryViewModel.super_.call(_this, options);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.emcontactsVm = new EmContactsViewModel({
      layersVm: _this.layersVm,
    });

    //
    // events
    //
  }
  utils.inherits(SummaryViewModel, ControllerViewModel);
  SummaryViewModel.prototype.viewTmpl = 'tmpl-security-summary';

  SummaryViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      cb();
      //@TODO: load real account
    }, 0);
  };

  return SummaryViewModel;
});
