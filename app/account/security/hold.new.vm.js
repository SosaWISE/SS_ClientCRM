define("src/account/security/hold.new.vm", [
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/combo.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  dataservice,
  ukov,
  ko,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema;
  schema = {
    _model: true,
    // AccountId: {},
    Catg2Id: {
      validators: [
        ukov.validators.isRequired("Secondary reason is required"),
      ],
    },
    HoldDescription: {
      validators: [
        ukov.validators.isRequired("Note is required"),
        ukov.validators.maxLength(4000, "Note must be less than {0} characters."),
      ],
    },
  };

  function HoldNewViewModel(options) {
    var _this = this;
    HoldNewViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "acctid",
      "catg1s",
      "catg1sFields",
      "catg2s",
      "catg2sFields",
    ]);

    _this.data = ukov.wrap({}, schema);

    _this.catg1Cvm = new ComboViewModel({
      list: _this.catg1s,
      fields: _this.catg1sFields,
    });
    _this.data.Catg2Cvm = new ComboViewModel({
      selectedValue: _this.data.Catg2Id,
      // list: _this.catg2s,
      fields: _this.catg2sFields,
    });

    //
    // subscriptions
    //
    _this.catg1Cvm.selectedValue.subscribe(function(selectedValue) {
      if (!selectedValue) {
        _this.data.NoteCategory1IdCvm.setList([]);
        return;
      }
      // filter Catg2 by selected Catg1
      _this.data.Catg2Cvm.setList(_this.catg2s.filter(function(catg2) {
        return catg2.Catg1Id === selectedValue;
      }));
    });

    //
    // events
    //
    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid.peek()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb();
      }
      var model = _this.data.getValue();
      dataservice.api_ms.accounts.save({
        id: _this.acctid,
        link: "holds",
        data: model,
      }, function(val) {
        _this.layerResult = val;
        closeLayer(_this);
      }, cb);
    });
  }

  utils.inherits(HoldNewViewModel, BaseViewModel);
  HoldNewViewModel.prototype.viewTmpl = "tmpl-security-hold_new";
  HoldNewViewModel.prototype.width = 450;
  HoldNewViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  HoldNewViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  HoldNewViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (!_this.layerResult) {
      if (_this.cmdSave.busy()) {
        msg = "Please wait for hold to be saved.";
      }
    }
    return msg;
  };

  return HoldNewViewModel;
});
