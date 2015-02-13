define('src/account/security/systemonlineinfo.vm', [
  'jquery',
  'ko',
  'src/dataservice',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  jquery,
  ko,
  dataservice,
  utils,
  ControllerViewModel
) {
  "use strict";

  // ** Special KO stuff
  ko.bindingHandlers.crsss = {
    update: function(element, valueAccessor) {
      var cls, creditGroup = valueAccessor();
      switch (creditGroup) {
        case "Excellent":
        case "Good":
          cls = "green";
          break;
        case "Sub":
          cls = "yellow";
          break;
        case "Poor":
          cls = "red";
          break;
        default:
          cls = "green";
          break;
      }
      jquery(element).addClass(cls);
    }
  };

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
    // _this.creditRank("Good");
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
    var _this = this;
    dataservice.monitoringstationsrv.msAccountStatusInformations.read({
      id: routeData.id,
    }, null, utils.safeCallback(join.add(), function(err, resp) {
      // ** Loop through results and bind information.
      resp.Value.forEach(function(item) {
        switch (item.KeyName) {
          case 'Credit Rank':
            _this.creditRank(item.Value);
            break;
        }
      });
    }, utils.no_op));
  };

  return SystemOnlineInfoViewModel;
});
