define("src/account/security/clist.industrynums.vm", [
  "dataservice",
  "ko",
  "src/slick/slickgrid.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  dataservice,
  ko,
  SlickGridViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListIndustryViewModel(options) {
    var _this = this;
    CListIndustryViewModel.super_.call(_this, options);

    _this.selectedIndustry = ko.observableArray();
    _this.mayReload = ko.observable(false);
    _this.industryAccounts = ko.observableArray();
    _this.industryAccountGvm = new SlickGridViewModel({
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [ //
        {
          id: "IndustryAccount",
          name: "CSID",
          field: "IndustryAccount",
        }, {
          id: "ReceiverNumber",
          name: "Receiver",
          field: "ReceiverNumber",
        }, {
          id: "OSDescription",
          name: "CS OS",
          field: "OSDescription",
        }, {
          id: "MonitoringStationName",
          name: "Central Station",
          field: "MonitoringStationName",
        }, {
          id: "PrimaryCSID",
          name: "Is Primary",
          field: "PrimaryCSID",
        }, {
          id: "SecondaryCSID",
          name: "Is Secondary",
          field: "SecondaryCSID",
        },
      ],
      onSelectedRowsChanged: function(rows) {
        _this.selectedIndustry(rows);
        if (rows.length > 0) {
          _this.selectedIndAcct = rows[0];
        }
      },
    });

    //
    // events
    //
    _this.cmdGenerate = ko.command(function(cb) {
      dataservice.monitoringstationsrv.msAccounts.save({
        id: _this.accountId,
        link: "GenerateIndustryAccount",
      }, null, function(genErr /*, resp*/ ) {
        // always reload industry accounts since after an industry number is generated there can be errors
        load_industryAccounts(_this, utils.safeCallback(cb, function() {
          // show generation error if there was one
          if (genErr) {
            notify.error(genErr);
          }
        }, notify.iferror));
      });
    });
    _this.cmdAssignPri = ko.command(function(cb) {
      dataservice.monitoringstationsrv.msIndustryAccounts.save({
        id: _this.selectedIndAcct.IndustryAccountID,
        link: "Primary",
      }, null, function(genErr /*, resp*/ ) {
        // always reload industry accounts since after an industry number is generated there can be errors
        load_industryAccounts2(_this, _this.industryAccountGvm, utils.safeCallback(cb, function() {
          // show generation error if there was one
          if (genErr) {
            notify.error(genErr);
          }
        }, notify.iferror));
      });
    }, function(busy) {
      var selectedIndustry = _this.selectedIndustry();
      return !busy && selectedIndustry.length > 0;
    });
    _this.cmdAssignSec = ko.command(function(cb) {
      dataservice.monitoringstationsrv.msIndustryAccounts.save({
        id: _this.selectedIndAcct.IndustryAccountID,
        link: "Secondary",
      }, null, function(genErr /*, resp*/ ) {
        // always reload industry accounts since after an industry number is generated there can be errors
        load_industryAccounts2(_this, _this.industryAccountGvm, utils.safeCallback(cb, function() {
          // show generation error if there was one
          if (genErr) {
            notify.error(genErr);
          }
        }, notify.iferror));
      });
    }, function(busy) {
      var selectedIndustry = _this.selectedIndustry();
      return !busy && selectedIndustry.length > 0;
    });
  }

  utils.inherits(CListIndustryViewModel, ControllerViewModel);
  CListIndustryViewModel.prototype.viewTmpl = "tmpl-security-clist_industrynums";

  CListIndustryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.accountId = routeData.id;
    // load_industryAccounts(_this, join.add());
    load_industryAccounts2(_this, _this.industryAccountGvm, join.add());
  };

  function load_industryAccounts(_this, cb) {
    // _this.industryAccounts([]); // do not reset
    dataservice.monitoringstationsrv.msAccounts.read({
      id: _this.accountId,
      link: "IndustryAccounts",
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (!err) {
        _this.industryAccounts(resp.Value);
      }
    }));
  }

  function load_industryAccounts2(_this, gvm, cb) {
    dataservice.monitoringstationsrv.msAccounts.read({
      id: _this.accountId,
      link: "IndustryAccountWithReceiverLines",
    }, gvm.list, utils.safeCallback(cb, function(err) {
      if (!err) {
        gvm.setSelectedRows([]);
      }
    }));
  }

  return CListIndustryViewModel;
});
