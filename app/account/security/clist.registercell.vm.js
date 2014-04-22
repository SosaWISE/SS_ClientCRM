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

    _this.allLoaded = ko.computed({
      deferEvaluation: true,
      read: function() {
        var vm = _this.vm();
        return _this.loaded() && vm && vm.loaded();
      }
    });

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
        //@TODO: decide which system (alarm.com or alarmnet)
        _this.vm(new AlarmDotComViewModel({
          id: _this.id,
          pcontroller: _this.pcontroller,
          layersVm: _this.layersVm,
        }));
        // _this.vm(new AlarmNetViewModel({
        //   id: _this.id,
        //   pcontroller: _this.pcontroller,
        //   layersVm: _this.layersVm,
        // }));

        _this.vm().load(routeData, extraData, join.add());
      }

      cb();
    }, 100);
  };

  return CListRegisterCellViewModel;
});
