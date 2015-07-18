define("src/salesreports/salesreports.panel.vm", [
  "src/salesreports/credits.and.installs.report.vm",
  "src/salesreports/myaccounts.report.vm",
  "src/salesreports/performance.report.vm",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/layers.vm",
  "src/core/controller.vm",
], function(
  CreditsAndInstallsReportViewModel,
  MyAccountsReportViewModel,
  PerformanceReportViewModel,
  ko,
  notify,
  utils,
  LayersViewModel,
  ControllerViewModel
) {
  "use strict";

  function SalesReportsPanelViewModel(options) {
    var _this = this;
    SalesReportsPanelViewModel.super_.call(_this, options);

    _this.reportsList = _this.childs;
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
  utils.inherits(SalesReportsPanelViewModel, ControllerViewModel);

  SalesReportsPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    var arrayCheckList = [ //
      new CreditsAndInstallsReportViewModel({
        pcontroller: _this,
        id: "creditsandinstalls",
        title: "Credits and Installations",
      }),
      new MyAccountsReportViewModel({
        pcontroller: _this,
        id: "myaccounts",
        title: "My Accounts",
      }),
      new MyAccountsReportViewModel({
        pcontroller: _this,
        id: "mystats",
        title: "My Stats",
      }),
      new PerformanceReportViewModel({
        pcontroller: _this,
        id: "performance",
        title: "Performance",
      }),
    ];

    _this.reportsList(arrayCheckList);

    join.add()();
  };

  return SalesReportsPanelViewModel;
});