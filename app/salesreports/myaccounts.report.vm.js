define("src/salesreports/myaccounts.report.vm", [
  "src/ukov",
  "dataservice",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ukov,
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function MyAccountsReportViewModel(options) {
    var _this = this;
    MyAccountsReportViewModel.super_.call(_this, options);

    _this.accounts = ko.observableArray([]);
    _this.filterRange = ko.observable("thisWeek");
    _this.filterRange.subscribe(function(newValue) {
      console.log("New Value: ", newValue);
      /** Figure out the date ranges. */

    });

    var today = new Date();
    _this.data = ukov.wrap({
      officeId: 0,
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,
    }, {
      _model: true,
      officeId: {},
      startDate: {
        converter: ukov.converters.datetime("Invalid start date"),
        validators: [
          ukov.validators.isRequired("Start date is required"),
        ],
      },
      endDate: {
        converter: ukov.converters.datetime("Invalid end date"),
        validators: [
          ukov.validators.isRequired("End date is required"),
        ],
      },
    });

    //
    // events
    //
    _this.cmdGo = ko.command(function(cb) {
      loadMyAccountsReport(_this, cb);
    });
  }
  utils.inherits(MyAccountsReportViewModel, ControllerViewModel);

  MyAccountsReportViewModel.prototype.viewTmpl = "tmpl-salesreports-myaccounts-report";

  MyAccountsReportViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.cmdGo.execute(join.add());

    join.add()();
  };

  function loadMyAccountsReport(_this, cb) {
    if (!_this.data.isValid.peek()) {
      notify.warn(_this.data.errMsg.peek(), null, 5);
      return cb();
    }

    return cb();
  }
  return MyAccountsReportViewModel;
});