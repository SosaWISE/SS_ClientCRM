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
  };

  function PerformanceReportViewModel(options) {
    var _this = this;
    PerformanceReportViewModel.super_.call(_this, options);

    _this.offices = ko.observableArray([]);
    _this.filterRange = ko.observable("thisWeek");
    _this.filterRange.subscribe(function(newValue) {
      console.log("New Value: ", newValue);
      /** Figure out the date ranges. */
      _this.dataLoaded(false);
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
      load_performance_report(_this, function() {});
    });

    _this.dataLoaded = ko.observable(true);
    _this.showSpinner = ko.computed(function() {
      // var vm = _this.vm();
      // return _this.active() && (!vm || !vm.loaded());
      return _this.active() && !_this.dataLoaded();
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

  function setLast30Days(_this) {
    var startDate = new Date(),
      endDate = new Date();

    // startDate = new Date((startDate.getMonth() + 1) + '/' + '1/' + startDate.getFullYear());
    startDate.setDate(startDate.getDate() - 30);
    _this.data.startDate(startDate);
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

    _this.dataLoaded(false);
    load_report(_this, "Performance", query, function(list) {
      console.log("MyAccounts Resp: ", list);

      var officeList = [];
      list.forEach(function(office) {
        var grp = {
          OfficeID: office.OfficeID,
          OfficeName: office.OfficeName,
          ContactsMade: office.ContactsMade,
          CreditsRun: office.CreditsRun,
          NoSales: office.NoSales,
          Installations: office.Installations,
          SalesPrice: office.SalesPrice,
          Term: office.Term,
          EzPay: office.EzPay,
          CloseRate: office.CloseRate,
          SetupFee: office.SetupFee,
          FirstMonth: office.FirstMonth,
          Over3Months: office.Over3Months,
          Referrals: office.Referrals,
          PackageSold: office.PackageSold,
          Margins: office.Margins,
          // cmdFindReps: ko.command(),
          salesReps: ko.observableArray([]),
          expanded: ko.observable(false),
        };
        grp.cmdFindReps = ko.command(function(cb1) {
          var qry1 = query;
          qry1.officeId = office.OfficeID;

          load_report(_this, "PerformanceOfficeBreakDown", qry1, function(officebdlist) {
            if (officebdlist.length > 0) {
              grp.expanded(true);
              //grp.salesReps(officebdlist);
              /** Get the Sales Rep Details. */
              var repList = [];
              officebdlist.forEach(function(repStats) {
                var stats = {
                  SalesRepID: repStats.SalesRepID,
                  RepName: repStats.RepName,
                  ContactsMade: repStats.ContactsMade,
                  CreditsRun: repStats.CreditsRun,
                  NoSales: repStats.NoSales,
                  Installations: repStats.Installations,
                  SalesPrice: repStats.SalesPrice,
                  Term: repStats.Term,
                  EzPay: repStats.EzPay,
                  CloseRate: repStats.CloseRate,
                  SetupFee: repStats.SetupFee,
                  FirstMonth: repStats.FirstMonth,
                  Over3Months: repStats.Over3Months,
                  Referrals: repStats.Referrals,
                  PackageSold: repStats.PackageSold,
                  Margins: repStats.Margins,
                  // cmdFindReps: ko.command(),
                  accounts: ko.observableArray([]),
                  acctExpanded: ko.observable(false),
                };
                stats.cmdShowAccounts = ko.command(function(cb2) {
                  var qry2 = qry1;
                  qry2.salesRepId = repStats.SalesRepID;
                  /** Get the account details. */
                  load_report(_this, "PerformanceSalesRepBreakDown", qry2, function(accountdblist) {
                    if (accountdblist.length > 0) {
                      stats.acctExpanded(true);
                      stats.accounts(accountdblist);
                    } else {
                      notify.warn("Sorry but '" + repStats.RepName + "' has not accounts to show.");
                    }
                  }, cb2);
                });

                repList.push(stats);
              });

              grp.salesReps(repList);
            } else {
              notify.warn("Sorry but the " + office.OfficeName + " office has no records to show for this query.");
            }
          }, cb1);
        });

        officeList.push(grp);
      });
      _this.offices(officeList);
      _this.dataLoaded(true);
    }, cb);

    return cb();
  }

  // function load_report(name, queryData, setter, cb) {
  //   dataservice.api_hr.reports.save({
  //     link: name,
  //     query: queryData,
  //   }, setter, cb);
  // } //

  function load_report(_this, name, queryData, setter, cb) {
    dataservice.api_hr.reports.save({
      link: name,
      query: queryData,
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Message && resp.Message !== "Success") {
        notify.error(resp, 3);
      }
      setter(resp.Value);
    }, function(err) {
      _this.dataLoaded(true);
      notify.iferror(err);
    }));
  } //


  function toSqlDateTime(dt) {
    return dt.getUTCFullYear() + '-' +
      ('00' + (dt.getUTCMonth() + 1)).slice(-2) + '-' +
      ('00' + dt.getUTCDate()).slice(-2) + ' ' +
      ('00' + dt.getUTCHours()).slice(-2) + ':' +
      ('00' + dt.getUTCMinutes()).slice(-2) + ':' +
      ('00' + dt.getUTCSeconds()).slice(-2);
  }

  return PerformanceReportViewModel;
});