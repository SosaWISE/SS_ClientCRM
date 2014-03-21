define('src/account/security/alarmdotcom.vm', [
  'src/dataservice',
  'src/account/security/alarmdotcom.editor.vm',
  'src/slick/slickgrid.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  AlarmDotComEditorViewModel,
  SlickGridViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function AlarmDotComViewModel(options) {
    var _this = this;
    AlarmDotComViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.IsRegistered = ko.observable(false);
    _this.receiverData = ko.observable();
    _this.detailsData = ko.observable();
    _this.equipmentGvm = new SlickGridViewModel({
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [
        {
          id: 'Zone',
          name: 'Zone',
          field: 'Zone',
        },
        {
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
        layersVm: _this.layersVm,
        item: utils.clone(_this.detailsData()),
        alarmComPackages: _this.alarmComPackages,
        alarmComPackageFields: {
          value: 'AlarmComPackageID',
          text: 'PackageName',
        },
      }), cb);

      cb();
    });
    _this.cmdRequestDeviceEquipment = ko.command(function(cb) {
      alert('RequestDeviceEquipment //@TODO: load data and add to grid: _this.equipmentGvm.list(resp.Value);');
      cb();
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
      alert('SwapModem');
      cb();
    });
  }
  utils.inherits(AlarmDotComViewModel, ControllerViewModel);
  AlarmDotComViewModel.prototype.viewTmpl = 'tmpl-security-alarmdotcom';

  AlarmDotComViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    load_vendorAlarmComPackages(function(result) {
      _this.alarmComPackages = result;
    }, join.add());

    setTimeout(function() {
      //@TODO: load real data

      _this.receiverData({
        AccountNumber: 'AccountNumber',
        IndustryNumber: 'IndustryNumber',
        ReceiverNumber: 'ReceiverNumber',
      });
      _this.detailsData({
        SerialNumber: 'SerialNumber',
        AlarmDotComCustomerNumber: 'AlarmDotComCustomerNumber',
        AlarmPackageId: 'BSCINT',
        EnableTwoWay: true,
      });

      cb();
    }, 2000);
  };

  function load_vendorAlarmComPackages(setter, cb) {
    dataservice.salessummary.vendorAlarmcomPacakges.read({}, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }, utils.no_op));
  }

  return AlarmDotComViewModel;
});
