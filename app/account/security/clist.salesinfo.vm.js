define("src/account/security/clist.salesinfo.vm", [
  "src/account/salesinfo/v02/salesinfo.vm",
  "src/account/salesinfo/v01/salesinfo.vm",
  "ko",
  "src/config",
  "src/core/numbers",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  SalesInfoV02ViewModel,
  SalesInfoV01ViewModel,
  ko,
  config,
  numbers,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSalesInfoViewModel(options) {
    var _this = this;
    CListSalesInfoViewModel.super_.call(_this, options);
    utils.assertProps(_this, ["layersVm"]);

    _this.mayReload = ko.observable(false);
    _this.vm = ko.observable();

    _this.showSpinner = ko.computed(function() {
      var vm = _this.vm();
      return _this.active() && (!vm || !vm.loaded());
    });
  }
  utils.inherits(CListSalesInfoViewModel, ControllerViewModel);
  CListSalesInfoViewModel.prototype.viewTmpl = "tmpl-security-clist_salesinfo";

  CListSalesInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    var acctid = routeData.id;

    var vm;
    if (acctid <= config.salesInfosMax.v01) {
      vm = new SalesInfoV01ViewModel({
        pcontroller: _this,
        layersVm: _this.layersVm,
      });
    } else if (acctid <= config.salesInfosMax.v02) {
      vm = new SalesInfoV02ViewModel({
        pcontroller: _this,
        layersVm: _this.layersVm,
      });
    }

    if (vm) {
      // _this.vms = [vm];
      // _this.vms.forEach(function(vm) {
      //   vm.load(routeData, extraData, join.add());
      // });
      vm.load(routeData, extraData, join.add());
      _this.vm(vm);
    } else {
      join.add()({
        Code: -1,
        Message: "Failed to find Sales Info version",
      });
      return;
    }
  };

  return CListSalesInfoViewModel;
});
