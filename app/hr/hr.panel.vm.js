define('src/hr/hr.panel.vm', [
  'ko',
  'src/dataservice',
  'src/core/layers.vm',
  'src/core/helpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  dataservice,
  LayersViewModel,
  helpers,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function HrPanelViewModel(options) {
    var _this = this;
    HrPanelViewModel.super_.call(_this, options);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
  }
  utils.inherits(HrPanelViewModel, ControllerViewModel);
  // HrPanelViewModel.prototype.viewTmpl = '';

  HrPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    join.add()();
  };

  return HrPanelViewModel;
});
