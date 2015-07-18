define("src/salesreports/performance.report.vm", [
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
  var schema = {
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
  };

  function PerformanceReportViewModel(options) {
    var _this = this;
    PerformanceReportViewModel.super_.call(_this, options);

    _this.filterRange = ko.observable("thisWeek");
    _this.filterRange.subscribe(function(newValue) {
      console.log("New Value: ", newValue);
      /** Figure out the date ranges. */
      switch (newValue) {
        case "thisWeek":
          setThisWeek(_this);
          break;
        case "today":
          setToday(_this);
          break;
        case "thisMonth":
          setThisMonth(_this);
          break;
        case "allTime":
          setAllTime(_this);
          break;
      }
    });


    var today = new Date();
    _this.data = ukov.wrap({
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,

    }, schema);

    //
    // events
    //
    _this.cmdGo = ko.command(function(cb) {
      load_report(_this, cb);
    });

  }

  utils.inherits(PerformanceReportViewModel, ControllerViewModel);

  PerformanceReportViewModel.prototype.viewTmpl = "tmpl-performance-report";

  PerformanceReportViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    setThisWeek(_this);
    _this.cmdGo.execute(join.add());

    join.add()();
  };

  function setThisWeek(_this) {
    var d = new Date(),
      today = d.getDay(),
      startDate = new Date(),
      endDate = new Date();

    startDate.setDate(d.getDate() + ((-1) * today));
    endDate.setDate(d.getDate() + (6 - today));

    _this.data.startDate(startDate);
    _this.data.endDate(endDate);

  }

  function setToday(_this) {
    var startDate = new Date(),
      endDate = new Date();

    _this.data.startDate(startDate);
    _this.data.endDate(endDate);

  }

  function setThisMonth(_this) {
    var startDate = new Date(),
      endDate = new Date();

    // startDate = new Date((startDate.getMonth() + 1) + '/' + '1/' + startDate.getFullYear());
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    _this.data.startDate(startDate);
    endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    _this.data.endDate(endDate);
  }

  function setAllTime(_this) {
    var startDate = new Date(),
      endDate = new Date();

    startDate = new Date(2013, 1, 1);
    _this.data.startDate(startDate);
    _this.data.endDate(endDate);
  }

  function load_report(_this, cb) {
    if (!_this.data.isValid.peek()) {
      notify.warn(_this.data.errMsg.peek(), null, 5);
      return cb();
    }
    return cb();
  }

  return PerformanceReportViewModel;
});