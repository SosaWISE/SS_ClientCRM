define('src/account/security/summary.vm', [
 'src/account/security/emcontacts.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
], function(
  EmContactsGridViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SummaryViewModel(options) {
    var _this = this;
    SummaryViewModel.super_.call(_this, options);

    _this.ecGvm = new EmContactsGridViewModel();

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
