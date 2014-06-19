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

    _this.mayReload = ko.observable(false);
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
    var _this = this,
      detailsData,
      invoice;

    _this.accountid = routeData.id;

    load_vendorAlarmComPackages(function(result) {
      _this.alarmComPackages = result;
    }, join.add());

    load_industryAccounts(_this.accountid, utils.safeCallback(join.add(), function(err, resp) {
      var first = resp.Value[0];
      _this.receiverData({
        AccountNumber: first.AccountId,
        IndustryNumber: first.IndustryAccount,
        ReceiverNumber: first.ReceiverNumber,
      });
    }, utils.noop));

    load_alarmcom(_this.accountid, 'accountStatus', null, utils.safeCallback(join.add(), function(err, resp) {
      var result = resp.Value;

      _this.isRegistered(result.RegistrationStatus === 1);
      detailsData = {
        SerialNumber: result.ModemSerial,
        AlarmDotComCustomerNumber: result.CustomerId,
        AlarmPackageId: result.ServicePlanPackageId,
        AlarmPackage: result.ServicePlanType,
        EnableTwoWay: result.EnableTwoWay,
        IsDemo: result.IsDemo,
      };

      if (!_this.isRegistered.peek()) {
        load_invoice(_this.accountid, function(val) {
          invoice = val;
        }, join.add());
      }
    }, utils.noop));

    join.when(function(err) {
      if (err) {
        return;
      }
      if (invoice) {
        detailsData.AlarmPackageId = invoice.AlarmComPackageId;
        _this.alarmComPackages.some(function(item) {
          if (item.AlarmComPackageID === invoice.AlarmComPackageId) {
            detailsData.AlarmPackage = item.PackageName;
            return true;
          }
        });
      }
      _this.detailsData(detailsData);
    });
  };


  function load_vendorAlarmComPackages(setter, cb) {
    dataservice.salessummary.vendorAlarmcomPacakges.read({}, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }, utils.noop));
  }

  function load_alarmcom(id, link, setter, cb) {
    dataservice.msaccountsetupsrv.alarmcom.read({
      id: id,
      link: link,
    }, setter, cb);
  }

  function load_invoice(id, setter, cb) {
    dataservice.salessummary.invoiceMsIsntalls.read({
      id: id,
      link: 'accountid'
    }, setter, cb);
  }

  function load_industryAccounts(id, cb) {
    dataservice.monitoringstationsrv.msAccounts.read({
      id: id,
      link: 'IndustryAccounts',
    }, null, cb);
  }

  function unregister(_this, cb) {
    dataservice.msaccountsetupsrv.alarmcom.save({
      id: _this.accountid,
      link: 'unregister',
    }, null, function(err, resp) {
      if (err) {
        notify.error(err);
        cb();
      } else if (!resp.Value) {
        notify.warn('Failed to unregister, but there wasn\'t and error...');
        cb();
      } else {
        _this.reload(cb);
      }
    });
  }

  return AlarmDotComViewModel;
});
