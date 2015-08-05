define("src/salesreports/salesreports.panel.vm", [
  "src/salesreports/credits.and.installs.report.vm",
  "src/salesreports/myaccounts.report.vm",
  "src/salesreports/performance.report.vm",
  "src/salesreports/accountholds.report.vm",
  "src/salesreports/pendinginstalls.report.vm",
  "ko",
  "dataservice",
  "src/core/notify",
  "src/core/utils",
  "howie",
  "src/core/layers.vm",
  "src/core/controller.vm",
], function(
  CreditsAndInstallsReportViewModel,
  MyAccountsReportViewModel,
  PerformanceReportViewModel,
  AccountHoldsReportViewModel,
  PendingInstallsReportViewModel,
  ko,
  dataservice,
  notify,
  utils,
  howie,
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
    var _this = this,
      user = howie.fetch("user");


    load_salesReps(_this, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
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
          salesRepList: _this.salesRepsForReports,
          user: user,
        }),
        new MyAccountsReportViewModel({
          pcontroller: _this,
          id: "mystats",
          title: "My Stats",
          salesRepList: _this.salesRepsForReports,
          user: user,
        }),
        new PerformanceReportViewModel({
          pcontroller: _this,
          id: "performance",
          title: "Performance",
          user: user,
        }),
        new AccountHoldsReportViewModel({
          pcontroller: _this,
          id: "accountholds",
          title: "My Holds",
          salesRepList: _this.salesRepsForReports,
          user: user,
        }),
        new PendingInstallsReportViewModel({
          pcontroller: _this,
          id: "pendinginstalls",
          title: "Pending Installs",
          salesRepList: _this.salesRepsForReports,
          user: user,
        }),
      ];

      _this.reportsList(arrayCheckList);

    });

  };

  function load_salesReps(_this, cb) {
    _this.salesRepsForReports = null;
    dataservice.humanresourcesrv.RuSalesRepList.read({}, null, utils.safeCallback(cb, function(err, resp) {
      _this.salesRepsForReports = resp.Value;
    }, utils.no_op));
  }

  return SalesReportsPanelViewModel;
});