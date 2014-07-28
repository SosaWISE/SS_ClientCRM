define('src/account/security/clist.initialpayment.vm', [
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

  function CListInitialPaymentViewModel(options) {
    var _this = this;
    CListInitialPaymentViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.mayReload = ko.observable(false);
    _this.breakdown = ko.observable();
    _this.initialPaymentMethod = ko.observable();
    _this.recurringSame = ko.observable(true);
    _this.recurringPaymentMethod = ko.observable();
    _this.addressSame = ko.observable(true);
    _this.address = ko.observable();


    //
    // events
    //
    _this.clickPaymentMethod = function() {
      var vm = _this.paybyVm;
      if (!vm) {
        _this.paybyVm = vm = new PayByViewModel();
      }
      _this.layersVm.show(vm, function onClose(result) {
        if (result) {
          _this.initialPaymentMethod(result);
        }
      });
    };
    _this.clickRecurringPaymentMethod = function() {
      var vm = _this.recurringPaybyVm;
      if (!vm) {
        _this.recurringPaybyVm = vm = new PayByViewModel();
      }
      _this.layersVm.show(vm, function onClose(result) {
        if (result) {
          _this.recurringPaymentMethod(result);
        }
      });
    };
    _this.clickAddress = function() {};

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
  utils.inherits(CListInitialPaymentViewModel, ControllerViewModel);
  CListInitialPaymentViewModel.prototype.viewTmpl = 'tmpl-security-clist_initialpayment';

  CListInitialPaymentViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      _this.breakdown({
        ActivationFee: 1,
        Monitoring: 2,
        SalesUpgrades: 3,
        TechUpgrades: 4,
        Subtotal: 10,
        Taxes: 0.7,
        Total: 10.7,
      });

      cb();
    }, 0);
  };

  return CListInitialPaymentViewModel;
});
