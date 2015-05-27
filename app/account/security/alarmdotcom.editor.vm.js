define("src/account/security/alarmdotcom.editor.vm", [
  "src/core/combo.vm",
  "src/ukov",
  "ko",
  "dataservice",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ComboViewModel,
  ukov,
  ko,
  dataservice,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    SerialNumber: {},
    // CellPackageItemId: {},
    EnableTwoWay: {},
  };

  function AlarmDotComEditorViewModel(options) {
    var _this = this;
    AlarmDotComEditorViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "accountid",
      "isRegistered",
      "alarmComPackages",
      "alarmComPackageFields",
    ]);

    _this.initFocusFirst();
    _this.data = ukov.wrap(_this.item || {
      EnableTwoWay: false,
    }, schema);
    // _this.data.CellPackageItemCvm = new ComboViewModel({
    //   selectedValue: _this.data.CellPackageItemId,
    //   list: CListSalesInfoViewModel.prototype.cellPackageItemOptions.filter(function(item) {
    //     return strings.startsWith(item.value, "CELL_SRV_AC");
    //   }),
    // });

    //
    // events
    //
    _this.cmdRegister = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);
      dataservice.msaccountsetupsrv.alarmcom.save({
        id: _this.accountid,
        link: "register",
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.layerResult = resp.Value;
        closeLayer(_this);
      }, function(err) {
        notify.error(err);
      }));
    });
  }
  utils.inherits(AlarmDotComEditorViewModel, BaseViewModel);
  AlarmDotComEditorViewModel.prototype.viewTmpl = "tmpl-security-alarmdotcom_editor";
  AlarmDotComEditorViewModel.prototype.width = 450;
  AlarmDotComEditorViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  AlarmDotComEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  AlarmDotComEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdRegister.busy() && !_this.layerResult) {
      msg = "Please wait for registration to finish.";
    }
    return msg;
  };

  AlarmDotComEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this,
    var cb = join.add();
    window.setTimeout(function() {
      //@TODO: load real data

      cb();
    }, 2000);
  };

  return AlarmDotComEditorViewModel;
});
