define('src/account/default/payby.vm', [
  'src/account/default/payby.credit.vm',
  'src/account/default/payby.eft.vm',
  'src/account/default/payby.invoice.vm',
  'src/dataservice',
  'ko',
  'src/ukov',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
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
      new PayByCreditViewModel(),
      new PayByEftViewModel(),
      new PayByInvoiceViewModel(),
    ];

    //
    // events
    //
    _this.clickMethod = function(vm) {
      _this.list.forEach(function(vm) {
        vm.setSelected(false);
      });
      vm.setSelected(true);
    };
  }
  utils.inherits(PayByViewModel, BaseViewModel);
  PayByViewModel.prototype.viewTmpl = 'tmpl-acct-default-payby';
  PayByViewModel.prototype.width = 800;
  PayByViewModel.prototype.height = 'auto';

  return PayByViewModel;
});
