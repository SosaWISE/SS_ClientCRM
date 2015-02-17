define('src/account/security/summary.vm', [
  'ko',
  'src/account/security/emcontacts.vm',
  'src/account/security/systemonlineinfo.vm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  EmContactsViewModel,
  SystemOnlineInfoViewModel,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SummaryViewModel(options) {
    var _this = this;
    SummaryViewModel.super_.call(_this, options);

    _this.mayReload = ko.observable(false);
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.emcontactsVm = new EmContactsViewModel({
      layersVm: _this.layersVm,
    });

    _this.systemonlineinfoVm = new SystemOnlineInfoViewModel({
      layersVm: _this.layersVm,
    });

    //
    // events
    //
  }
  utils.inherits(SummaryViewModel, ControllerViewModel);
  SummaryViewModel.prototype.viewTmpl = 'tmpl-security-summary';

  SummaryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.emcontactsVm.loader.reset(); //incase of reload
    _this.emcontactsVm.load(routeData, extraData, join.add());
    _this.systemonlineinfoVm.loader.reset(); //incase of reload
    _this.systemonlineinfoVm.load(routeData, extraData, join.add());

    //@TODO: load real account
  };

  return SummaryViewModel;
});
