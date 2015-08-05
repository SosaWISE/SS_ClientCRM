define("src/salesreports/myaccounts.report.vm", [
  "src/ukov",
  "dataservice",
  "src/core/combo.vm",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ukov,
  dataservice,
  ComboViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function MyAccountsReportViewModel(options) {
    var _this = this;
    MyAccountsReportViewModel.super_.call(_this, options);

    _this.salesRepsList = options.salesRepList;
    _this.accounts = ko.observableArray([]);
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
      loadMyAccountsReport(_this, function() {});
    });

    _this.dataLoaded = ko.observable(true);
    _this.showSpinner = ko.computed(function() {
      // var vm = _this.vm();
      // return _this.active() && (!vm || !vm.loaded());
      return _this.active() && !_this.dataLoaded();
    });

    var today = new Date();
    _this.data = ukov.wrap({
      officeId: 0,
      salesRepId: options.user.GPEmployeeID,
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,
    }, {
      _model: true,
      officeId: {},
      startDate: {
        converter: ukov.converters.datetime("Invalid start date."),
        validators: [
          ukov.validators.isRequired("Start date is required."),
        ],
      },
      endDate: {
        converter: ukov.converters.datetime("Invalid end date."),
        validators: [
          ukov.validators.isRequired("End date is required."),
        ],
      },
      salesRepId: {
        validators: [
          ukov.validators.isRequired("Sales Rep is a required field."),
        ],
      }
    });

    _this.data.SalesRepsCvm = new ComboViewModel({
      noItemSelectedText: '[Choose a Sales Rep]',
      selectedValue: _this.data.salesRepId,
      list: _this.salesRepsList,
      fields: {
        value: "SalesRepId",
        text: "FullName",
      },
      nullable: true,
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

  function loadMyAccountsReport(_this, cb) {
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
    load_report("MyAccounts", query, function(resp) {
      console.log("MyAccounts Resp: ", resp);
      _this.accounts(resp);
      _this.dataLoaded(true);
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

  return MyAccountsReportViewModel;
});