define("src/salesreports/pendinginstalls.report.vm", [
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
    salesRepId: {},
    DealerId: {},
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
    preSurvey: {}
  };

  function PendingInstallsReportViewModel(options) {
    var _this = this;
    PendingInstallsReportViewModel.super_.call(_this, options);

    _this.accounts = ko.observableArray([]);
    _this.filterRange = ko.observable("thisWeek");
    _this.filterRange.subscribe(function(newValue) {
      /** Figure out the date ranges. */
      switch (newValue) {
        case "thisWeek":
          setThisWeek(_this);
          break;
        case "today":
          setToday(_this);
          break;
        case "last30Days":
          setLast30Days(_this);
          break;
        case "thisMonth":
          setThisMonth(_this);
          break;
        case "allTime":
          setAllTime(_this);
          break;
      }
    });
    _this.filterSurvey = ko.observable("");
    _this.filterSurvey.subscribe(function(newValue) {
      console.log("PreSurvey: ", newValue);
      console.log("thisWeek: ", _this.filterRange());

      _this.data.preSurvey(newValue);
      switch (_this.filterRange()) {
        case "thisWeek":
          setThisWeek(_this);
          break;
        case "today":
          setToday(_this);
          break;
        case "last30Days":
          setLast30Days(_this);
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
      load_performance_report(_this, cb);
    });

  }

  utils.inherits(PendingInstallsReportViewModel, ControllerViewModel);

  PendingInstallsReportViewModel.prototype.viewTmpl = "tmpl-pendinginstalls-report";

  PendingInstallsReportViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
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

  function setLast30Days(_this) {
    var startDate = new Date(),
      endDate = new Date();

    // startDate = new Date((startDate.getMonth() + 1) + '/' + '1/' + startDate.getFullYear());
    startDate.setDate(startDate.getDate() - 30);
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

  function load_performance_report(_this, cb) {
    if (!_this.data.isValid.peek()) {
      notify.warn(_this.data.errMsg.peek(), null, 5);
      return cb();
    }
    // request data
    var query = _this.data.getValue();
    query.endDate.setHours(23, 59, 59, 997); // end of day (.997 is sql server datetime friendly)
    query.startDate = toSqlDateTime(query.startDate);
    query.endDate = toSqlDateTime(query.endDate);
    load_report("PendingInstalls", query, function(list) {
      console.log("Pending Installs Resp: ", list);
      _this.accounts(list);
    }, cb);

    return cb();
  }

  function load_report(name, queryData, setter, cb) {
    dataservice.api_hr.reports.save({
      link: name,
      query: queryData,
    }, setter, cb);
  } //

  function toSqlDateTime(dt) {
    return dt.getUTCFullYear() + '-' +
      ('00' + (dt.getUTCMonth() + 1)).slice(-2) + '-' +
      ('00' + dt.getUTCDate()).slice(-2) + ' ' +
      ('00' + dt.getUTCHours()).slice(-2) + ':' +
      ('00' + dt.getUTCMinutes()).slice(-2) + ':' +
      ('00' + dt.getUTCSeconds()).slice(-2);
  }

  return PendingInstallsReportViewModel;
});