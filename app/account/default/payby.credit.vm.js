define('src/account/default/payby.credit.vm', [
  'src/core/ccardhelper',
  'ko',
  'src/ukov',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  ccardhelper,
  ko,
  ukov,
  ComboViewModel,
  notify,
  BaseViewModel,
  utils
) {
  "use strict";

  var schema,
    validationGroup,
    cardTypeIdToNameMap;

  validationGroup = {
    keys: ['CardTypeId', 'CardNumber', 'VerificationValue'],
    // no validators needed here, just need this in order to revalidate
    // CardNumber and VerificationValue whenever CardTypeId changes
    validators: [],
  };

  cardTypeIdToNameMap = {
    1: 'visa',
    2: 'mastercard',
    3: 'discover',
    4: 'amex',
  };

  // cardTypeIdToCCVMap = {
  //   1: 'CVV (Card Verification Value)',
  //   2: 'CVC (Card Validation Code)',
  //   3: 'CID (Card Identification Number)',
  //   4: 'CID (Card Identification Number)',
  // };

  schema = {
    _model: true,
    CardTypeId: {
      // converter: ukov.converters.toUpper(),
      validationGroup: validationGroup,
      validators: [
        ukov.validators.isRequired('Card type is required'),
      ],
    },
    CardNumber: {
      converter: ukov.converters.ccard(),
      validationGroup: validationGroup,
      validators: [
        ukov.validators.isRequired('Card number is required'),
        function(val, model) {
          var name = cardTypeIdToNameMap[model.CardTypeId];
          if (!ccardhelper.isValidCreditCard(name, val)) {
            return 'Invalid credit card number';
          }
        },
      ],
    },
    VerificationValue: {
      // converter: ukov.converters.toUpper(),
      validationGroup: validationGroup,
      validators: [
        ukov.validators.isRequired('CVV is required'),
        function(val, model) {
          var length = val.length,
            isAmex = model.CardTypeId === 4; // American Express
          if ((isAmex && length !== 4) || (!isAmex && length !== 3)) {
            return 'Invalid CVV for Card type';
          }
        },
      ],
    },
    ExpirationMonth: {
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Expiration month is required'),
      ],
    },
    ExpirationYear: {
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Expiration year is required'),
      ],
    },
    NameOnCard: {
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Name on card is required'),
      ],
    },
  };

  function PayByCreditViewModel(options) {
    var _this = this;
    PayByCreditViewModel.super_.call(_this, options);

    _this.title = 'Credit Card';

    _this.data = ukov.wrap({
      CardTypeId: null,
      CardNumber: '',
      VerificationValue: '',
      ExpirationMonth: '',
      ExpirationYear: '',
      NameOnCard: '',
    }, schema);
    _this.data.CardTypeCvm = new ComboViewModel({
      selectedValue: _this.data.CardTypeId,
      list: _this.cardTypeOptions,
      fields: {
        value: 'CreditCardTypeID',
        text: 'CardType',
      },
    });
    _this.data.ExpirationMonthCvm = new ComboViewModel({
      selectedValue: _this.data.ExpirationMonth,
      list: ccardhelper.getExpirationMonths(),
      noItemSelectedText: 'Month',
    });
    _this.data.ExpirationYearCvm = new ComboViewModel({
      selectedValue: _this.data.ExpirationYear,
      list: ccardhelper.getExpirationYears(),
      noItemSelectedText: 'Year',
    });

    _this.cvvMsg = ko.computed({
      deferEvaluation: true,
      read: function() {
        var msg;
        if (_this.data.CardTypeId() === 4) { // American Express
          msg = "4-digit code on front of card";
        } else {
          msg = "3-digit code on back of card";
        }
        return msg;
      }
    });

    _this.selected = ko.observable();
    _this.setSelected(false);

    //
    // events
    //
  }
  utils.inherits(PayByCreditViewModel, BaseViewModel);
  PayByCreditViewModel.prototype.viewTmpl = 'tmpl-acct-default-payby_credit';

  PayByCreditViewModel.prototype.setSelected = function(selected) {
    var _this = this;
    _this.selected(selected);
    // update model
    _this.data.ignore(!selected);
    _this.data.update(false, true);
  };

  PayByCreditViewModel.prototype.cardTypeOptions = [
    {
      CreditCardTypeID: 1,
      CardType: 'Visa',
    },
    {
      CreditCardTypeID: 2,
      CardType: 'MasterCard',
    },
    {
      CreditCardTypeID: 3,
      CardType: 'Discover',
    },
    {
      CreditCardTypeID: 4,
      CardType: 'American Express',
    },
  ];

  return PayByCreditViewModel;
});
