define('src/account/default/payby.eft.vm', [
  'ko',
  'src/ukov',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
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
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Account number is required'),
      ],
    },
    RoutingNumber: {
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Routing number is required'),
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
    _this.selected(selected);
    // update model
    _this.data.ignore(!selected);
    _this.data.update(false, true);
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
      value: 1,
      text: ''
    },
  ];

  return PayByEftViewModel;
});
