define("src/contracts/cancel.vm", [
  "src/account/mscache",
  "dataservice",
  "src/ukov",
  "ko",
  "src/core/combo.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  mscache,
  dataservice,
  ukov,
  ko,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var dateConverter = ukov.converters.date();
  var schema = {
    _model: true,
    //
    CancelDate: {
      converter: dateConverter,
      validators: [
        ukov.validators.isRequired("Cancel Date is required"),
      ],
    },
    AccountCancelReasonId: {
      validators: [
        ukov.validators.isRequired("Cancel Reason is required"),
      ],
    },
  };

  function CancelViewModel(options) {
    var _this = this;
    CancelViewModel.super_.call(_this, options);
    utils.assertPropFuncs(_this, [
      "save",
    ]);
    _this.mixinLoad();
    _this.initFocusFirst();
    _this.initHandler();

    _this.data = ukov.wrap({}, schema);
    _this.data.AccountCancelReasonCvm = new ComboViewModel({
      selectedValue: _this.data.AccountCancelReasonId,
      fields: mscache.metadata("types/accountCancelReasons"),
    }).subscribe(mscache.getList("types/accountCancelReasons"), _this.handler);

    //
    // events
    //
    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb();
      }
      var model = _this.data.getValue();
      _this.save(model, function(err) {
        if (!err) {
          _this.layerResult = true;
          closeLayer(_this);
        }
        cb(err);
      });
    });
  }

  utils.inherits(CancelViewModel, BaseViewModel);
  CancelViewModel.prototype.viewTmpl = "tmpl-contracts-cancel";
  CancelViewModel.prototype.width = 450;
  CancelViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  CancelViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  CancelViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (!_this.layerResult) {
      if (_this.cmdSave.busy()) {
        msg = "Please wait for cancel to finish.";
      }
    }
    return msg;
  };

  CancelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this;
    mscache.ensure("types/accountCancelReasons", join.add());
  };


  return CancelViewModel;
});
