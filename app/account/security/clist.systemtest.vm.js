define('src/account/security/clist.systemtest.vm', [
  'src/account/default/rep.find.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  RepFindViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSystemTestViewModel(options) {
    var _this = this;
    CListSystemTestViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    //
    // events
    //
  }
  utils.inherits(CListSystemTestViewModel, ControllerViewModel);
  CListSystemTestViewModel.prototype.viewTmpl = 'tmpl-security-clist_systemtest';

  CListSystemTestViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this,
    var cb = join.add();
    setTimeout(function() {
      //@TODO: load real data

      cb();
    }, 2000);
  };

  return CListSystemTestViewModel;
});
