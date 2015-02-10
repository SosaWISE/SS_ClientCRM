define('src/account/security/alarmdotcom.editor.vm', [
  'src/core/combo.vm',
  'src/ukov',
  'ko',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
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

  var schema;

  schema = {
    _model: true,
    SerialNumber: {},
    AlarmDotComCustomerNumber: {},
    // AlarmPackageId: {},
    EnableTwoWay: {},
  };

  function AlarmDotComEditorViewModel(options) {
    var _this = this;
    AlarmDotComEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'accountid',
      'isRegistered',
      'alarmComPackages',
      'alarmComPackageFields',
    ]);

    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap(_this.item || {
      SerialNumber: '',
      AlarmDotComCustomerNumber: '',
      // AlarmPackageId: null,
      EnableTwoWay: false,
    }, schema);
    // _this.data.AlarmPackageCvm = new ComboViewModel({
    //   selectedValue: _this.data.AlarmPackageId,
    //   list: _this.alarmComPackages,
    //   fields: _this.alarmComPackageFields,
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
        link: 'register',
        data: model,
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
  utils.inherits(AlarmDotComEditorViewModel, BaseViewModel);
  AlarmDotComEditorViewModel.prototype.viewTmpl = 'tmpl-security-alarmdotcom_editor';
  AlarmDotComEditorViewModel.prototype.width = 450;
  AlarmDotComEditorViewModel.prototype.height = 'auto';

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
      msg = 'Please wait for registration to finish.';
    }
    return msg;
  };

  AlarmDotComEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this,
    var cb = join.add();
    setTimeout(function() {
      //@TODO: load real data

      cb();
    }, 2000);
  };

  return AlarmDotComEditorViewModel;
});
