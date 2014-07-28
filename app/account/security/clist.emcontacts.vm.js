define('src/account/security/clist.emcontacts.vm', [
  'src/account/default/rep.find.vm',
  'src/account/security/emcontacts.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  RepFindViewModel,
  EmContactsViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListEmcontactsViewModel(options) {
    var _this = this;
    CListEmcontactsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.mayReload = ko.observable(false);
    _this.data = ko.observable();
    _this.repModel = ko.observable();

    _this.emcontactsVm = new EmContactsViewModel({
      layersVm: _this.layersVm,
    });

    //
    // events
    //
  }
  utils.inherits(CListEmcontactsViewModel, ControllerViewModel);
  CListEmcontactsViewModel.prototype.viewTmpl = 'tmpl-security-clist_emcontacts';

  CListEmcontactsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.emcontactsVm.loader.reset(); // incase of reload
    _this.emcontactsVm.load(routeData, extraData, join.add());
  };

  return CListEmcontactsViewModel;
});
