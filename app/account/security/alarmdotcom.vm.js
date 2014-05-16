define('src/account/security/alarmdotcom.vm', [
  'src/dataservice',
  'src/account/security/alarmdotcom.swapmodem.vm',
  'src/account/security/alarmdotcom.editor.vm',
  'src/slick/slickgrid.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  AlarmDotComSwapModemViewModel,
  AlarmDotComEditorViewModel,
  SlickGridViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function AlarmDotComViewModel(options) {
    var _this = this;
    AlarmDotComViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.isRegistered = ko.observable(false);
    _this.receiverData = ko.observable();
    _this.detailsData = ko.observable();
    _this.equipmentGvm = new SlickGridViewModel({
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [ //
        {
          id: 'Zone',
          name: 'Zone',
          field: 'Zone',
        }, {
          id: 'EquipmentDescription',
          name: 'Equipment Description',
          field: 'EquipmentDescription',
        },
      ],
    });

    //
    // events
    //
    _this.cmdEditDetails = ko.command(function(cb) {
      _this.layersVm.show(new AlarmDotComEditorViewModel({
        accountid: _this.accountid,
        isRegistered: _this.isRegistered(),
        item: utils.clone(_this.detailsData()),
        alarmComPackages: _this.alarmComPackages,
        alarmComPackageFields: {
          value: 'AlarmComPackageID',
          text: 'PackageName',
        },
      }), function(result) {
        if (!result) {
          cb();
        } else {
          _this.reload(cb);
        }
      });
    });
    _this.cmdRequestDeviceEquipment = ko.command(function(cb) {
      _this.equipmentGvm.list([]);
      load_alarmcom(_this.accountid, 'equipmentList', _this.equipmentGvm.list, cb);
    }, function(busy) {
      return !busy && _this.isRegistered();
    });

    _this.cmdR = ko.command(function(cb) {
      _this.reload(cb);
    });

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

    _this.cmdSwapModem = ko.command(function(cb) {
      _this.layersVm.show(new AlarmDotComSwapModemViewModel({
        accountid: _this.accountid,
      }), function(result) {
        if (result) {
          _this.reload(cb);
        } else {
          cb();
        }
      });
    }, function(busy) {
      return !busy && _this.isRegistered();
    });
    _this.cmdUnregister = ko.command(function(cb) {
      notify.confirm('Unregister Alarm.Com Account?', 'Are you sure you want to unregister this Alarm.Com account?', function(result) {
        if (result === 'yes') {
          unregister(_this, cb);
        } else {
          cb();
        }
      });
    }, function(busy) {
      return !busy && _this.isRegistered();
    });
  }
  utils.inherits(AlarmDotComViewModel, ControllerViewModel);
  AlarmDotComViewModel.prototype.viewTmpl = 'tmpl-security-alarmdotcom';

  AlarmDotComViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountid = routeData.id;

    load_vendorAlarmComPackages(function(result) {
      _this.alarmComPackages = result;
    }, join.add());

    //@TODO: load real data
    _this.receiverData({
      AccountNumber: 'AccountNumber goes here',
      IndustryNumber: 'IndustryNumber goes here',
      ReceiverNumber: 'ReceiverNumber goes here',
    });

    load_alarmcom(_this.accountid, 'accountStatus', function(result) {
      _this.isRegistered(result.RegistrationStatus === 1);
      _this.detailsData({
        SerialNumber: result.ModemSerial,
        AlarmDotComCustomerNumber: result.CustomerId,
        AlarmPackageId: result.ServicePlanType,
        EnableTwoWay: result.EnableTwoWay,
        IsDemo: result.IsDemo,
      });
    }, join.add());
  };


  function load_vendorAlarmComPackages(setter, cb) {
    dataservice.salessummary.vendorAlarmcomPacakges.read({}, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }, utils.no_op));
  }

  function load_alarmcom(id, link, setter, cb) {
    dataservice.msaccountsetupsrv.alarmcom.read({
      id: id,
      link: link,
    }, setter, cb);
  }

  function unregister(_this, cb) {
    dataservice.msaccountsetupsrv.alarmcom.save({
      id: _this.accountid,
      link: 'unregister',
    }, null, function(err, resp) {
      if (err) {
        notify.notify('error', err.Message);
        cb();
      } else if (!resp.Value) {
        notify.notify('warn', 'Failed to unregister, but there wasn\'t and error...');
        cb();
      } else {
        _this.reload(cb);
      }
    });
  }

  return AlarmDotComViewModel;
});
