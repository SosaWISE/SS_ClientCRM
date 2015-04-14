define("src/account/default/payby.invoice.vm", [
  "ko",
  "src/ukov",
  "src/core/notify",
  "src/core/base.vm",
  "src/core/utils",
], function(
  ko,
  ukov,
  notify,
  BaseViewModel,
  utils
) {
  "use strict";

  var schema = {
    _model: true,

    //
    ID: {},
    ModifiedOn: {},
    //

    CheckNumber: {
      converter: ukov.converters.numText(),
      validators: [
        ukov.validators.isRequired("Check number is required"),
      ],
    },
  };

  function PayByInvoiceViewModel(options) {
    var _this = this;
    PayByInvoiceViewModel.super_.call(_this, options);

    _this.title = "Invoice";

    _this.data = ukov.wrap(_this.item || {
      CheckNumber: "",
    }, schema);

    _this.selected = ko.observable();
    _this.setSelected(false);
  }
  utils.inherits(PayByInvoiceViewModel, BaseViewModel);
  PayByInvoiceViewModel.prototype.viewTmpl = "tmpl-acct-default-payby_invoice";

  PayByInvoiceViewModel.prototype.setSelected = function(selected) {
    var _this = this;
    _this.data.ignore(!selected);
    _this.selected(selected);
  };

  return PayByInvoiceViewModel;
});
