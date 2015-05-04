define("src/account/default/payby.vm", [
  "src/account/default/payby.credit.vm",
  "src/account/default/payby.ach.vm",
  "src/account/default/payby.invoice.vm",
  "src/dataservice",
  "ko",
  "src/ukov",
  "src/core/notify",
  "src/core/base.vm",
  "src/core/utils",
], function(
  PayByCreditViewModel,
  PayByEftViewModel,
  PayByInvoiceViewModel,
  dataservice,
  ko,
  ukov,
  notify,
  BaseViewModel,
  utils
) {
  "use strict";

  function PayByViewModel(options) {
    var _this = this;
    PayByViewModel.super_.call(_this, options);

    _this.list = [
      new PayByEftViewModel({
        item: _this.item,
        paymentTypeId: "ACH",
      }),
      new PayByCreditViewModel({
        item: _this.item,
        paymentTypeId: "CC",
      }),
      new PayByInvoiceViewModel({
        item: _this.item,
        paymentTypeId: "CHCK",
      }),
    ];
    _this.selectedVm = ko.observable();

    //
    // events
    //
    _this.clickMethod = function(vm) {
      var selectedVm = _this.selectedVm();
      if (selectedVm) {
        selectedVm.setSelected(false);
      }
      vm.setSelected(true);
      _this.selectedVm(vm);
    };
    _this.cmdSave = ko.command(function(cb) {
      var selectedVm = _this.selectedVm();
      if (!selectedVm.data.isValid()) {
        notify.warn(selectedVm.data.errMsg(), null, 7);
        cb();
        return;
      }

      var model = selectedVm.data.getValue();
      model.PaymentTypeId = selectedVm.paymentTypeId;
      model.AccountTypeId = model.AccountTypeId || null;
      model.CardTypeId = model.CardTypeId || null;
      model.CheckNumber = model.CheckNumber || null;
      _this.layerResult = model;
      closeLayer(_this);
      cb();
    });

    //
    var selectIndex = 0;
    if (_this.item) {
      if (_this.item.AccountTypeId) {
        selectIndex = 0;
      } else if (_this.item.CardTypeId) {
        selectIndex = 1;
      } else if (_this.item.CheckNumber) {
        selectIndex = 2;
      }
    }
    _this.clickMethod(_this.list[selectIndex]);
  }
  utils.inherits(PayByViewModel, BaseViewModel);
  PayByViewModel.prototype.viewTmpl = "tmpl-acct-default-payby";
  PayByViewModel.prototype.width = 800;
  PayByViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  PayByViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return PayByViewModel;
});
