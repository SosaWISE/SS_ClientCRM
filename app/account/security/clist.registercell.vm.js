define('src/account/security/clist.registercell.vm', [
  'src/account/security/telguard.vm',
  'src/account/security/alarmdotcom.vm',
  'src/account/security/alarmnet.vm',
  'ko',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  TelguardViewModel,
  AlarmDotComViewModel,
  AlarmNetViewModel,
  ko,
  dataservice,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListRegisterCellViewModel(options) {
    var _this = this;
    CListRegisterCellViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.mayReload = ko.observable(false);
    _this.cellErrMsg = ko.observable();

    //
    // events
    //
    _this.cmd = ko.command(function(cb) {
      cb();
    });
  }
  utils.inherits(CListRegisterCellViewModel, ControllerViewModel);
  CListRegisterCellViewModel.prototype.viewTmpl = 'tmpl-security-clist_registercell';

  CListRegisterCellViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountId = routeData.id;

    load_msAccountSalesInformations(_this.accountId, utils.safeCallback(join.add(), function(err, resp) {
      var Ctor, vm;
      switch (resp.Value.CellularVendor) {
        case 'Alarm.net':
          Ctor = AlarmNetViewModel;
          break;
        case 'Telguard':
          Ctor = TelguardViewModel;
          break;
        default:
        case 'Alarm.com':
          Ctor = AlarmDotComViewModel;
          break;
      }
      if (Ctor) {
        vm = new Ctor({
          id: _this.id,
          pcontroller: _this.pcontroller,
          layersVm: _this.layersVm,
        });
        // set as only child
        _this.childs([vm]);
        // vm.load will be called in controller.vm.js
        // vm.load(routeData, extraData, join.add());
      } else {
        notify.warn('Invalid CellType: ' + resp.Value.CellType);
      }
    }, utils.noop));
  };


  function load_msAccountSalesInformations(accountId, cb) {
    dataservice.monitoringstationsrv.msAccountSalesInformations.read({
      id: accountId,
    }, null, cb);
  }

  return CListRegisterCellViewModel;
});
