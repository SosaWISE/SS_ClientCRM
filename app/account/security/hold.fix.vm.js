define("src/account/security/hold.fix.vm", [
  "dataservice",
  "src/ukov",
  "ko",
  "src/account/acctstore",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  dataservice,
  ukov,
  ko,
  acctstore,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema;
  schema = {
    _model: true,
    // AccountHoldID: {},
    FixedNote: {
      validators: [
        ukov.validators.isRequired("Closing note is required"),
        ukov.validators.maxLength(4000, "Closing note must be less than {0} characters."),
      ],
    },
    ModifiedOn: {},
  };

  function HoldFixViewModel(options) {
    var _this = this;
    HoldFixViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "reason",
      "item",
    ]);

    _this.fixed = !!_this.item.FixedOn;

    _this.data = ukov.wrap(_this.item, schema);

    //
    // events
    //
    _this.clickClose = function() {
      _this.layerResult = false;
      closeLayer(_this);
    };

    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid.peek()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb();
      }
      var model = _this.data.getValue();
      acctstore.update(_this.item.AccountId, "holds", _this.item.AccountHoldID, model, function() {
        _this.layerResult = true;
        closeLayer(_this);
      }, cb);
    }, function(busy) {
      return !busy && !_this.fixed;
    });
  }

  utils.inherits(HoldFixViewModel, BaseViewModel);
  HoldFixViewModel.prototype.viewTmpl = "tmpl-security-hold_fix";
  HoldFixViewModel.prototype.width = 450;
  HoldFixViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  HoldFixViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  HoldFixViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (!_this.layerResult) {
      if (_this.cmdSave.busy()) {
        msg = "Please wait for hold to be saved.";
      }
    }
    return msg;
  };

  return HoldFixViewModel;
});
