define("src/salesreports/credits.and.installs.report.vm", [
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

  function CreditsAndInstallsReportViewModel(options) {
    var _this = this;
    CreditsAndInstallsReportViewModel.super_.call(_this, options);

    _this.groupByOffice = ko.observable(true);
    _this.salesReps = ko.observable();
    _this.officeData = ko.observable();

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
      loadCreditsAndInstalls(_this, cb);
    });
  }
  utils.inherits(CreditsAndInstallsReportViewModel, ControllerViewModel);
  CreditsAndInstallsReportViewModel.prototype.viewTmpl = "tmpl-salesreports-credits_and_installs_report";

  CreditsAndInstallsReportViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;



    _this.cmdGo.execute(join.add());
  };

  function loadCreditsAndInstalls(_this, cb) {
    if (!_this.data.isValid.peek()) {
      notify.warn(_this.data.errMsg.peek(), null, 5);
      return cb();
    }

    // reset data
    _this.salesReps(null);
    _this.officeData(null);
    // request data
    var query = _this.data.getValue();
    query.endDate.setHours(23, 59, 59, 997); // end of day (.997 is sql server datetime friendly)
    query.startDate = toSqlDateTime(query.startDate);
    query.endDate = toSqlDateTime(query.endDate);
    load_report("CreditAndInstalls", query, function(allReps) {
      // group data
      var officeData = [];
      var map = {};
      allReps.forEach(function(rep) {
        var id = rep.TeamLocationID;
        var grp = map[id];
        if (!grp) {
          map[id] = grp = {
            TeamLocationID: id,
            TeamLocation: rep.TeamLocation,
            expanded: ko.observable(false),
            NumContacts: 0,
            NumCredits: 0,
            NumInstalls: 0,
            salesReps: [],
          };
          officeData.push(grp);
        }
        grp.NumContacts += rep.NumContacts;
        grp.NumCredits += rep.NumCredits;
        grp.NumInstalls += rep.NumInstalls;
        rep.Accounts = ko.observableArray([]);
        rep.expanded = ko.observable(false);
        rep.cmdFindAccounts = ko.command(function(cb) {
          rep.expanded(true);

          var newQuery = {
            startDate: query.startDate,
            endDate: query.endDate,
            salesRepId: rep.SalesRepID,
            officeId: id,
          };

          load_report("MyAccounts", newQuery, function(allAccts) {
            allAccts.forEach(function(acct) {
              rep.Accounts.push(acct);
            });
          }, cb);
        });

        grp.salesReps.push(rep);

      });

      // set all data
      _this.salesReps(allReps);
      // set grouped data
      _this.officeData(officeData);
    }, cb);
  } //
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

  return CreditsAndInstallsReportViewModel;
});