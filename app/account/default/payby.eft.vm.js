define('src/account/default/payby.eft.vm', [
  'src/core/paymenthelper',
  'ko',
  'src/ukov',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  paymenthelper,
  ko,
  ukov,
  ComboViewModel,
  notify,
  BaseViewModel,
  utils
) {
  "use strict";

  var schema = {
    _model: true,
    AccountTypeId: {
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Account type is required'),
      ],
    },
    AccountNumber: {
      converter: ukov.converters.string(),
      // converter: ukov.converters.numText(),
      validators: [
        ukov.validators.isRequired('Account number is required'),
        // ukov.validators.isInLengthRange(4, 17, 'Account number must be between {0} and {1} characters long'),
      ],
    },
    RoutingNumber: {
      converter: ukov.converters.numText(),
      validators: [
        ukov.validators.isRequired('Routing number is required'),
        function(val) {
          if (!paymenthelper.isValidRoutingNum(val)) {
            return 'Invalid routing number';
          }
        },
      ],
    },
    NameOnAccount: {
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Name on account is required'),
      ],
    },
  };

  function PayByEftViewModel(options) {
    var _this = this;
    PayByEftViewModel.super_.call(_this, options);

    _this.title = 'Bank Account';

    _this.data = ukov.wrap({
      AccountTypeId: null,
      AccountNumber: '',
      RoutingNumber: '',
      NameOnAccount: '',
    }, schema);
    _this.data.AccountTypeCvm = new ComboViewModel({
      selectedValue: _this.data.AccountTypeId,
      list: _this.accountTypeOptions,
      fields: {
        value: 'BankAccountTypeID',
        text: 'AccountType',
      }
    });

    _this.selected = ko.observable();
    _this.setSelected(false);

    //
    // events
    //
  }
  utils.inherits(PayByEftViewModel, BaseViewModel);
  PayByEftViewModel.prototype.viewTmpl = 'tmpl-acct-default-payby_eft';

  PayByEftViewModel.prototype.setSelected = function(selected) {
    var _this = this;
    _this.data.ignore(!selected);
    _this.selected(selected);
  };

  PayByEftViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      _this = _this;
      cb();
    }, 0);
  };

  PayByEftViewModel.prototype.accountTypeOptions = [
    {
      BankAccountTypeID: 1,
      AccountType: 'Checking',
    },
    {
      BankAccountTypeID: 2,
      AccountType: 'Saving',
    },
  ];

  return PayByEftViewModel;
});
