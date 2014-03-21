define('src/account/security/alarmdotcom.editor.vm', [
  'src/core/combo.vm',
  'src/ukov',
  'ko',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ComboViewModel,
  ukov,
  ko,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    SerialNumber: {},
    AlarmDotComCustomerNumber: {},
    AlarmPackageId: {},
    EnableTwoWay: {},
  };

  function AlarmDotComEditorViewModel(options) {
    var _this = this;
    AlarmDotComEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'layersVm',
      'alarmComPackages',
      'alarmComPackageFields',
    ]);

    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap(_this.item || {
      SerialNumber: '',
      AlarmDotComCustomerNumber: '',
      AlarmPackageId: null,
      EnableTwoWay: false,
    }, schema);
    _this.data.AlarmPackageCvm = new ComboViewModel({
      selectedValue: _this.data.AlarmPackageId,
      list: _this.alarmComPackages,
      fields: _this.alarmComPackageFields,
    });

    //
    // events
    //
    _this.cmdValidateAccountNum = ko.command(function(cb) {
      alert('ValidateAccountNum');
      cb();
    });
    _this.cmdValidateIndustryNum = ko.command(function(cb) {
      alert('ValidateIndustryNum');
      cb();
    });
    _this.cmdValidateSerialNum = ko.command(function(cb) {
      alert('ValidateSerialNum');
      cb();
    });
    _this.cmdRegister = ko.command(function(cb) {
      alert('Register');
      cb();
    });
    _this.cmdUnregister = ko.command(function(cb) {
      alert('Unregister');
      cb();
    });
    _this.cmdSwapModem = ko.command(function(cb) {
      alert('SwapModem');
      cb();
    });
    _this.cmdRequestDeviceEquipment = ko.command(function(cb) {
      alert('RequestDeviceEquipment');
      cb();
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
