define('src/account/security/clist.submitonline.vm', [
  'src/account/security/dispatchagencys.finder.vm',
  'src/account/security/dispatchagencys.gvm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  DispatchAgencysFinderViewModel,
  DispatchAgencysGridViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSubmitOnlineViewModel(options) {
    var _this = this;
    CListSubmitOnlineViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.gvm = new DispatchAgencysGridViewModel();

    //
    // events
    //
    _this.cmdFind = ko.command(function(cb) {
      _this.layersVm.show(new DispatchAgencysFinderViewModel(), function(result) {
        if (result) {
          alert(result);
        }
        cb();
      });
    });
    _this.cmdAdd = ko.command(function(cb) {
      // showEquipmentEditor(_this, false, cb);
      cb();
    });
  }
  utils.inherits(CListSubmitOnlineViewModel, ControllerViewModel);
  CListSubmitOnlineViewModel.prototype.viewTmpl = 'tmpl-security-clist_submitonline';

  CListSubmitOnlineViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this,
    join = join;
    //@TODO: load real data
  };

  return CListSubmitOnlineViewModel;
});
