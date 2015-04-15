define("src/account/security/alarmdotcom.swapmodem.vm", [
  "src/core/combo.vm",
  "src/ukov",
  "ko",
  "src/dataservice",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ComboViewModel,
  ukov,
  ko,
  dataservice,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,
    NewSerialNumber: {},
    SwapReason: {
      converter: nullStrConverter,
    },
    SpecialRequest: {
      converter: nullStrConverter,
    },
    RestoreBackedUpSettingsAfterSwap: {},
  };

  function AlarmDotComSwapModemViewModel(options) {
    var _this = this;
    AlarmDotComSwapModemViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "accountid",
    ]);
    _this.initFocusFirst();

    _this.data = ukov.wrap(_this.item || {
      NewSerialNumber: "",
      SwapReason: null,
      SpecialRequest: null,
      RestoreBackedUpSettingsAfterSwap: false,
    }, schema);

    //
    // events
    //
    _this.cmdSwap = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);
      dataservice.msaccountsetupsrv.alarmcom.save({
        id: _this.accountid,
        link: "swapmodem",
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.layerResult = resp.Value;
        closeLayer(_this);
      }, function(err) {
        notify.error(err);
      }));
    });
  }
  utils.inherits(AlarmDotComSwapModemViewModel, BaseViewModel);
  AlarmDotComSwapModemViewModel.prototype.viewTmpl = "tmpl-security-alarmdotcom_swapmodem";
  AlarmDotComSwapModemViewModel.prototype.width = 450;
  AlarmDotComSwapModemViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  AlarmDotComSwapModemViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  AlarmDotComSwapModemViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSwap.busy() && !_this.layerResult) {
      msg = "Please wait for modem swap to finish.";
    }
    return msg;
  };

  // AlarmDotComSwapModemViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
  //   // var _this = this,
  //   var cb = join.add();
  //   setTimeout(function() {
  //     //@TODO: load real data
  //     cb();
  //   }, 2000);
  // };

  return AlarmDotComSwapModemViewModel;
});
