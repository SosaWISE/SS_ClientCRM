define('src/account/security/clist.systemtest.vm', [
  'src/account/security/signalhistory.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  SignalHistoryViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSystemTestViewModel(options) {
    var _this = this;
    CListSystemTestViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.mayReload = ko.observable(false);
    _this.signalHistoryVm = new SignalHistoryViewModel({
      layersVm: _this.layersVm,
    });

    //
    // events
    //
    _this.cmdInitTwoWay = ko.command(function(cb) {
      cb();
    });
    _this.cmdComplete = ko.command(function(cb) {
      cb();
    });
    // _this.cmdSaveConfirmation = ko.command(function(cb) {
    //   cb();
    // });
  }
  utils.inherits(CListSystemTestViewModel, ControllerViewModel);
  CListSystemTestViewModel.prototype.viewTmpl = 'tmpl-security-clist_systemtest';

  CListSystemTestViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.signalHistoryVm.load(routeData, extraData, join.add());
  };

  return CListSystemTestViewModel;
});
