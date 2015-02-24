define('src/contracts/contracts.panel.vm', [
  'ko',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function ContractsPanelViewModel(options) {
    var _this = this;
    ContractsPanelViewModel.super_.call(_this, options);

    _this.showNav = ko.observable(true); // && config.hr.showNav);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(ContractsPanelViewModel, ControllerViewModel);

  ContractsPanelViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.childs([ //
    ]);
  };

  return ContractsPanelViewModel;
});
