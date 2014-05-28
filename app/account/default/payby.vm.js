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
    _this.clickMethod(_this.list[0]); // select first in list
    _this.cmdSave = ko.command(function(cb) {
      var selectedVm = _this.selectedVm();
      if (!selectedVm.data.isValid()) {
        notify.notify('warn', selectedVm.data.errMsg(), null, 7);
        cb();
        return;
      }

      if (_this.layer) {
        _this.layer.close(selectedVm.data.getValue());
      }

      cb();
    });

  }
  utils.inherits(PayByViewModel, BaseViewModel);
  PayByViewModel.prototype.viewTmpl = 'tmpl-acct-default-payby';
  PayByViewModel.prototype.width = 800;
  PayByViewModel.prototype.height = 'auto';

  return PayByViewModel;
});
