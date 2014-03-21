define('src/account/security/clist.registercell.vm', [
  'src/account/security/alarmdotcom.vm',
  'src/account/security/alarmnet.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  AlarmDotComViewModel,
  AlarmNetViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListRegisterCellViewModel(options) {
    var _this = this;
    CListRegisterCellViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.cellErrMsg = ko.observable();
    _this.vm = ko.observable();

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
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: load real data

      var success = true;
      if (!success) {
        _this.cellErrMsg('asdf');
      } else {
        _this.vm(new AlarmDotComViewModel({
          layersVm: _this.layersVm,
        }));
        // _this.vm(new AlarmNetViewModel({
        //   layersVm: _this.layersVm,
        // }));

        _this.vm().load(routeData, extraData, join.add());
      }

      cb();
    }, 2000);
  };

  return CListRegisterCellViewModel;
});
