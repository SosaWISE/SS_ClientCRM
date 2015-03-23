define('src/funding/funding.panel.vm', [
  'src/funding/packets.vm',
  'ko',
  'src/core/utils',
  'src/core/layers.vm',
  'src/core/controller.vm',
], function(
  PacketsViewModel,
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
  }

  utils.inherits(FundingPanelViewModel, ControllerViewModel);

  FundingPanelViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.childs([
      new PacketsViewModel({
        pcontroller: _this,
        id: 'packets',
        title: 'Packets',
        layersVm: _this.layersVm,
      })

    ]);
  };

  return FundingPanelViewModel;

});
