define('src/account/security/systemonlineinfo.vm', [
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SystemOnlineInfoViewModel(options) {
    var _this = this;
    SystemOnlineInfoViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    // ** Properties
    _this.creditRank = ko.observable();
    _this.contract = ko.observable();
    _this.billing = ko.observable();
    _this.funding = ko.observable();
    _this.centralStation = ko.observable();
    _this.monitoringStatus = ko.observable();
    _this.cellProvider = ko.observable();
    _this.cellStatus = ko.observable();

    // ** Bind data
    _this.creditRank("Good");
    _this.contract("Inactive");
    _this.billing("Active");
    _this.funding("In House");
    _this.centralStation("Monitronics");
    _this.monitoringStatus("Online | On Test");
    _this.cellProvider("Alarm.com");
    _this.cellStatus("Registered");

  }
  utils.inherits(SystemOnlineInfoViewModel, ControllerViewModel);
  SystemOnlineInfoViewModel.prototype.viewTmpl = 'tmpl-systemonline-info';

  SystemOnlineInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base

  };

  return SystemOnlineInfoViewModel;
});
