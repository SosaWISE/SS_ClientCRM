define("src/account/security/clist.submitonline.vm", [
  "src/account/security/dispatchagencys.finder.vm",
  "src/account/security/dispatchagency.editor.vm",
  "src/account/security/dispatchagencys.gvm",
  "src/dataservice",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  DispatchAgencysFinderViewModel,
  DispatchAgencyEditorViewModel,
  DispatchAgencysGridViewModel,
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSubmitOnlineViewModel(options) {
    var _this = this;
    CListSubmitOnlineViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
    ]);

    _this.mayReload = ko.observable(false);
    _this.gvm = new DispatchAgencysGridViewModel({
      edit: function(agency, cb) {
        showDispatchAgencyEditor(_this, utils.clone(agency), cb);
      },
    });

    _this.submissionData = ko.observable();
    _this.salesInfo = ko.observable();

    //
    // events
    //
    _this.cmdFind = ko.command(function(cb) {
      _this.layersVm.show(new DispatchAgencysFinderViewModel({
        accountId: _this.accountId,
      }), function(result) {
        if (result) {
          load_dispatchAgencys(_this.accountId, _this.gvm, function() {
            cb(null);
          });
        }
        cb();
      });
    });
    _this.cmdAdd = ko.command(function(cb) {
      showDispatchAgencyEditor(_this, null, function(model, deleted) {
        if (model && !deleted) {
          // add new agency
          _this.gvm.list.push(model);
          // // reload grid
          // load_dispatchAgencys(_this, function() {
          //   cb(null);
          // });
        }
        cb();
      });
    });
    _this.cmdSubmit = ko.command(function(cb) {
      dataservice.monitoringstationsrv.msAccounts.save({
        data: {
          AccountId: _this.accountId,
        },
      }, function(val) {
        if (val) {
          if (val.WasSuccessfull) {
            notify.info("Successfully submitted online!", null, 7);
            val.Msg = "Submission Succeeded!";
          } else {
            notify.warn("Failed to submit account online.", null, 7);
            val.Msg = "Submission Failed...";
          }
          _this.submissionData(val);
        }
      }, cb);
    });
  }
  utils.inherits(CListSubmitOnlineViewModel, ControllerViewModel);
  CListSubmitOnlineViewModel.prototype.viewTmpl = "tmpl-security-clist_submitonline";

  CListSubmitOnlineViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountId = routeData.id;

    load_dispatchAgencys(_this.accountId, _this.gvm, join.add());
    load_accountDetails(_this.accountId, function(val) {
      var msOsId = (val || {}).MonitoringStationOsId || 'AG_ALARMSYS'; //@HACK: for null value
      load_dispatchAgencyTypes(msOsId, function(val) {
        _this.dispatchAgencyTypes = val;
      }, join.add());
    }, join.add());

    load_msAccountSalesInformations(_this.accountId, _this.salesInfo, join.add());
  };

  function load_dispatchAgencys(accountId, gvm, cb) {
    gvm.list([]);
    dataservice.monitoringstationsrv.msAccounts.read({
      id: accountId,
      link: "DispatchAgencyAssignments",
    }, gvm.list, cb);
  }

  function load_accountDetails(accountId, setter, cb) {
    dataservice.monitoringstationsrv.accounts.read({
      id: accountId,
      link: 'details'
    }, setter, cb);
  }

  function load_dispatchAgencyTypes(msOsId, setter, cb) {
    dataservice.monitoringstationsrv.dispatchAgencyTypes.read({
      id: msOsId,
    }, setter, cb);
  }

  function load_msAccountSalesInformations(acctid, setter, cb) {
    dataservice.monitoringstationsrv.msAccountSalesInformations.read({
      id: acctid,
    }, setter, cb);
  }

  function showDispatchAgencyEditor(_this, agency, cb) {
    agency = utils.clone(agency);
    _this.layersVm.show(new DispatchAgencyEditorViewModel({
      item: agency,
      accountId: _this.accountId,
      dispatchAgencyTypes: _this.dispatchAgencyTypes,
      dispatchAgencyTypeFields: {
        value: "DispatchAgencyTypeID",
        text: "DispatchAgencyType",
      },
    }), cb);
  }

  return CListSubmitOnlineViewModel;
});
