define('src/account/default/initialpayment.vm', [
  'src/account/default/payby.vm',
  'src/dataservice',
  'ko',
  'src/ukov',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/controller.vm',
  'src/core/utils',
], function(
  PayByViewModel,
  dataservice,
  ko,
  ukov,
  ComboViewModel,
  notify,
  ControllerViewModel,
  utils
) {
  "use strict";

  function InitialPaymentViewModel(options) {
    var _this = this;
    InitialPaymentViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.paymentMethod = ko.observable();


    //
    // events
    //
    _this.cmdPaymentMethod = ko.command(function(cb) {
      var vm = _this.paybyVm;
      if (!vm) {
        _this.paybyVm = vm = new PayByViewModel();
      }
      _this.layersVm.show(vm, function onClose(result) {
        if (result) {
          _this.paymentMethod(result);
        }
      });

      cb();
    });

    _this.cmdRunPayment = ko.command(function(cb) {
      cb();
    });

    // _this.methodCvm = new ComboViewModel({
    //   fields: {
    //     text: 'PaymentMethod',
    //     value: 'PaymentMethodId',
    //   },
    //   list: [
    //     {
    //       PaymentMethodId: 1,
    //       PaymentMethod: 'Credit Card',
    //     },
    //     {
    //       PaymentMethodId: 2,
    //       PaymentMethod: 'EFT',
    //     },
    //     {
    //       PaymentMethodId: 3,
    //       PaymentMethod: 'Invoice',
    //     },
    //   ],
    // });
    // _this.methodCvm.selectedValue.subscribe(function(id) {
    //   switch (id) {
    //     case 1:
    //       break;
    //     case 2:
    //       break;
    //     case 3:
    //       break;
    //   }
    // });
    //
    // _this.methodCvm.selectedValue(1);
  }
  utils.inherits(InitialPaymentViewModel, ControllerViewModel);
  InitialPaymentViewModel.prototype.viewTmpl = 'tmpl-acct-default-initialpayment';

  InitialPaymentViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      _this = _this;
      cb();
    }, 0);
  };

  return InitialPaymentViewModel;
});
