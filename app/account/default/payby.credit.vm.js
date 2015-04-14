define("src/account/default/payby.credit.vm", [
  "src/core/paymenthelper",
  "ko",
  "src/ukov",
  "src/core/combo.vm",
  "src/core/notify",
  "src/core/base.vm",
  "src/core/utils",
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

  ko.bindingHandlers.cardTypeId = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      // pass through to `text` binding
      ko.bindingHandlers.text.init(element, valueAccessor, allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var id = valueAccessor();

      function newValueAccessor() {
        var result;
        cardTypeOptions.some(function(item) {
          if (item.CreditCardTypeID === id) {
            result = item.CardType;
            return true;
          }
        });
        return result;
      }
      // call `text`
      ko.bindingHandlers.text.update(element, newValueAccessor, allBindings, viewModel, bindingContext);
    },
  };


  var schema,
    nullStrConverter = ukov.converters.nullString(),
    cardTypeIdToNameMap,
    cardValidationGroup,
    expirationValidationGroup,
    cardTypeOptions;

  cardTypeIdToNameMap = {
    1: "visa",
    2: "mastercard",
    3: "discover",
    4: "amex",
  };
  // cardTypeIdToCCVMap = {
  //   1: "CVV (Card Verification Value)",
  //   2: "CVC (Card Validation Code)",
  //   3: "CID (Card Identification Number)",
  //   4: "CID (Card Identification Number)",
  // };

  cardValidationGroup = {
    keys: ["CardTypeId", "CardNumber", "VerificationValue"],
    // no validators needed here, just need this in order to revalidate
    // CardNumber and VerificationValue whenever CardTypeId changes
    validators: [],
  };
  expirationValidationGroup = {
    keys: ["ExpirationMonth", "ExpirationYear"],
    validators: [ //
      function(group) {
        if (!paymenthelper.isValidExpiration(group.ExpirationYear, group.ExpirationMonth)) {
          return "Invalid expiration date";
        }
      },
    ],
  };

  schema = {
    _model: true,

    //
    ID: {},
    ModifiedOn: {},
    //

    CardTypeId: {
      // converter: ukov.converters.toUpper(),
      validationGroup: cardValidationGroup,
      validators: [
        ukov.validators.isRequired("Card type is required"),
      ],
    },
    CardNumber: {
      converter: ukov.converters.ccard(),
      validationGroup: cardValidationGroup,
      validators: [
        ukov.validators.isRequired("Card number is required"),
        function(val, model) {
          var name = cardTypeIdToNameMap[model.CardTypeId];
          if (!paymenthelper.isValidCreditCard(name, val)) {
            return "Invalid credit card number";
          }
        },
      ],
    },
    VerificationValue: {
      converter: nullStrConverter,
      validationGroup: cardValidationGroup,
      validators: [
        // ukov.validators.isRequired("Security Code is required"),
        function(val, model) {
          if (val == null) {
            return;
          }
          var length = val.length,
            isAmex = model.CardTypeId === 4; // American Express
          if ((isAmex && length !== 4) || (!isAmex && length !== 3)) {
            return "Invalid Security Code for Card type";
          }
        },
      ],
    },
    ExpirationMonth: {
      // converter: ukov.converters.toUpper(),
      validationGroup: expirationValidationGroup,
      validators: [
        ukov.validators.isRequired("Expiration month is required"),
      ],
    },
    ExpirationYear: {
      // converter: ukov.converters.toUpper(),
      validationGroup: expirationValidationGroup,
      validators: [
        ukov.validators.isRequired("Expiration year is required"),
      ],
    },
    NameOnCard: {
      // converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired("Name on card is required"),
      ],
    },
  };

  function PayByCreditViewModel(options) {
    var _this = this;
    PayByCreditViewModel.super_.call(_this, options);

    _this.title = "Credit Card";

    _this.data = ukov.wrap(_this.item || {
      CardTypeId: null,
      CardNumber: "",
      VerificationValue: "",
      ExpirationMonth: null,
      ExpirationYear: null,
      NameOnCard: "",
    }, schema);
    _this.data.CardTypeCvm = new ComboViewModel({
      selectedValue: _this.data.CardTypeId,
      list: cardTypeOptions,
      fields: {
        value: "CreditCardTypeID",
        text: "CardType",
      },
    });
    _this.data.ExpirationMonthCvm = new ComboViewModel({
      selectedValue: _this.data.ExpirationMonth,
      list: paymenthelper.getExpirationMonths(),
      noItemSelectedText: "Month",
    });
    _this.data.ExpirationYearCvm = new ComboViewModel({
      selectedValue: _this.data.ExpirationYear,
      list: paymenthelper.getExpirationYears(),
      noItemSelectedText: "Year",
    });
    // // this feels like a HACK...
    // _this.data.Expiration.getValue = function() {
    //   return _this.data.ExpirationMonth.getValue() + "/" + _this.data.ExpirationYear.getValue();
    // };

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
  PayByCreditViewModel.prototype.viewTmpl = "tmpl-acct-default-payby_credit";

  PayByCreditViewModel.prototype.setSelected = function(selected) {
    var _this = this;
    _this.data.ignore(!selected);
    _this.selected(selected);
  };

  cardTypeOptions = [ //
    {
      CreditCardTypeID: 1,
      CardType: "Visa",
    }, {
      CreditCardTypeID: 2,
      CardType: "MasterCard",
    }, {
      CreditCardTypeID: 3,
      CardType: "Discover",
    }, {
      CreditCardTypeID: 4,
      CardType: "American Express",
    },
  ];

  return PayByCreditViewModel;
});
