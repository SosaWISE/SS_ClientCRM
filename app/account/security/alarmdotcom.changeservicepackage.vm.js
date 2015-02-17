define("src/account/security/alarmdotcom.changeservicepackage.vm", [
  "src/account/security/clist.salesinfo.vm",
  "src/core/combo.vm",
  "src/ukov",
  "ko",
  "src/dataservice",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  CListSalesInfoViewModel,
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

  var schema = {
    _model: true,
    CellPackageItemId: {},
  };

  function AlarmDotComChangeServicePackageViewModel(options) {
    var _this = this;
    AlarmDotComChangeServicePackageViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "accountid",
      "CellPackageItemId",
    ]);

    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({
      CellPackageItemId: _this.CellPackageItemId,
    }, schema);

    _this.data.CellPackageItemCvm = new ComboViewModel({
      selectedValue: _this.data.CellPackageItemId,
      list: CListSalesInfoViewModel.prototype.cellPackageItemOptions.filter(function(item) {
        return strings.startsWith(item.value, "CELL_SRV_AC");
      }),
    });

    //
    // events
    //
    _this.cmdChange = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);
      dataservice.msaccountsetupsrv.alarmcom.save({
        id: _this.accountid,
        link: "ChangeServicePackage",
        query: {
          CellPackageItemId: model.CellPackageItemId,
        },
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.layerResult = resp.Value;
        closeLayer(_this);
      }, function(err) {
        notify.error(err);
      }));
    });

    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(AlarmDotComChangeServicePackageViewModel, BaseViewModel);
  AlarmDotComChangeServicePackageViewModel.prototype.viewTmpl = "tmpl-security-alarmdotcom_changeservicepackage";
  AlarmDotComChangeServicePackageViewModel.prototype.width = 450;
  AlarmDotComChangeServicePackageViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  AlarmDotComChangeServicePackageViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  AlarmDotComChangeServicePackageViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdChange.busy() && !_this.layerResult) {
      msg = "Please wait for change to finish.";
    }
    return msg;
  };

  // AlarmDotComChangeServicePackageViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
  //   // var _this = this,
  //   var cb = join.add();
  //   setTimeout(function() {
  //     //@TODO: load real data
  //
  //     cb();
  //   }, 2000);
  // };

  return AlarmDotComChangeServicePackageViewModel;
});
