define("src/salesreports/salesreports.panel.vm", [
  "src/salesreports/credits.and.installs.report.vm",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  CreditsAndInstallsReportViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SalesReportsPanelViewModel(options) {
    var _this = this;
    SalesReportsPanelViewModel.super_.call(_this, options);

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(SalesReportsPanelViewModel, ControllerViewModel);

  SalesReportsPanelViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.childs([ //
      new CreditsAndInstallsReportViewModel({
        pcontroller: _this,
        id: "creditsandinstalls",
        title: "Credits and Installations",
      }),
    ]);
  };

  return SalesReportsPanelViewModel;
});
