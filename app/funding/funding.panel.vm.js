define('src/funding/funding.panel.vm', [
  'src/funding/packets.vm',
  'src/funding/criterias.vm',
  'src/funding/bundles.vm',
  'ko',
  'src/core/utils',
  'src/core/layers.vm',
  'src/core/controller.vm',
], function(
  PacketsViewModel,
  CriteriasViewModel,
  BundlesViewModel,
  ko,
  utils,
  LayersViewModel,
  ControllerViewModel
) {
  "use strict";

  function FundingPanelViewModel(options) {
    var _this = this;
    FundingPanelViewModel.super_.call(_this, options);

    // ** Properties
    _this.showNav = ko.observable(true);

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

  utils.inherits(FundingPanelViewModel, ControllerViewModel);

  FundingPanelViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.childs([
      new CriteriasViewModel({
        pcontroller: _this,
        id: 'criterias',
        title: 'Criterias',
        layersVm: _this.layersVm,
      }),
      _this.defaultChild = new PacketsViewModel({
        pcontroller: _this,
        id: 'packets',
        title: 'Packets',
        layersVm: _this.layersVm,
      }),
      new BundlesViewModel({
        pcontroller: _this,
        id: 'bundles',
        title: 'Bundles',
        layersVm: _this.layersVm,
      }),
    ]);
  };

  return FundingPanelViewModel;

});
