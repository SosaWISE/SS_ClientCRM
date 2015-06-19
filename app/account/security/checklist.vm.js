define("src/account/security/checklist.vm", [
  "dataservice",
  "ko",
  "src/account/security/clist.qualify.vm",
  "src/account/security/clist.salesinfo.vm",
  "src/account/security/clist.survey.vm",
  "src/account/security/clist.industrynums.vm",
  "src/account/security/clist.emcontacts.vm",
  "src/account/security/clist.systemdetails.vm",
  "src/account/security/clist.registercell.vm",
  "src/account/security/clist.systemtest.vm",
  "src/account/security/clist.initialpayment.vm",
  "src/account/security/clist.submitonline.vm",
  "src/core/layers.vm",
  "src/core/notify", "src/core/utils", "src/core/controller.vm",
], function(
  dataservice,
  ko,
  CListQualifyViewModel,
  CListSalesInfoViewModel,
  CListSurveyViewModel,
  CListIndustryViewModel,
  CListEmcontactsViewModel,
  CListSystemDetailsViewModel,
  CListRegisterCellViewModel,
  CListSystemTestViewModel,
  CListInitialPaymentViewModel,
  CListSubmitOnlineViewModel,
  LayersViewModel,
  notify, utils, ControllerViewModel
) {
  "use strict";

  function ChecklistViewModel(options) {
    var _this = this;
    ChecklistViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);

    _this.checklist = _this.childs;

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    // _this.cmd = ko.command(function(cb) {
    //   cb();
    // });
  }
  utils.inherits(ChecklistViewModel, ControllerViewModel);
  ChecklistViewModel.prototype.viewTmpl = "tmpl-security-checklist";

  ChecklistViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    call_hasCustomer(routeData.masterid, function(hasCustomer) {
      // if (_this.id === routeData.masterid && hasCustomer) {
      if (routeData.route === "leads" && hasCustomer) {
        // close this tab
        _this.closeMsg = utils.noop; // allows closing
        _this.close();
        // then redirect to masteraccount
        _this.goTo({
          route: "accounts",
          masterid: routeData.masterid,
        });
        notify.info("Redirected to account", null, 2);
        // we"re done here
        return;
      }

      dataservice.checklistsrv.checklist.read({
        id: routeData.id || 0,
        link: 'MsAccount',
      }, null, utils.safeCallback(join.add(), function(err, resp) {
        if (resp.Code === 0) {
          _this.pulledCheckList = resp.Value;

          _this.qualifyVm = new CListQualifyViewModel({
            pcontroller: _this,
            id: "qualify",
            title: "Qualify Customer",
            isDone: ko.observable(_this.pulledCheckList.Qualify),
            layersVm: _this.layersVm,
            hasCustomer: hasCustomer,
          });
          var checkListArray = [
            _this.qualifyVm,
            new CListSalesInfoViewModel({
              pcontroller: _this,
              id: "salesinfo",
              title: "Sales Info",
              isDone: ko.observable(_this.pulledCheckList.SalesInfo),
              layersVm: _this.layersVm,
            }),
            new CListSurveyViewModel({
              pcontroller: _this,
              id: "presurvey",
              title: "Pre Survey",
              isDone: ko.observable(_this.pulledCheckList.PreSurvey),
              surveyTypeId: 1000, //@HACK: need better way of knowing the id of the survey type
            }),
            new CListIndustryViewModel({
              pcontroller: _this,
              id: "industrynums",
              title: "Industry #s",
              isDone: ko.observable(_this.pulledCheckList.IndustryNumbers),
            }),
            new CListEmcontactsViewModel({
              pcontroller: _this,
              id: "emcontacts",
              title: "Emergency Contacts",
              isDone: ko.observable(_this.pulledCheckList.EmergencyContacts),
              layersVm: _this.layersVm,
            }),
            new CListSystemDetailsViewModel({
              pcontroller: _this,
              id: "systemdetails",
              title: "System Details",
              isDone: ko.observable(_this.pulledCheckList.SystemDetails),
              layersVm: _this.layersVm,
            }),
            new CListRegisterCellViewModel({
              pcontroller: _this,
              id: "registercell",
              title: "Register Cell",
              isDone: ko.observable(_this.pulledCheckList.RegisterCell),
              layersVm: _this.layersVm,
            }),
            new CListSystemTestViewModel({
              pcontroller: _this,
              id: "systemtest",
              title: "System Test",
              isDone: ko.observable(_this.pulledCheckList.SystemTest),
              layersVm: _this.layersVm,
            }),
            // for now we are not doing Tech inspections
            // new CListSurveyViewModel({
            //   pcontroller: _this,
            //   id: "techinspection",
            //   title: "Tech Inspection",
            //   isDone: ko.observable(_this.pulledCheckList.TechInspection),
            // }),
            new CListSurveyViewModel({
              pcontroller: _this,
              id: "postsurvey",
              title: "Post Survey",
              isDone: ko.observable(_this.pulledCheckList.PostSurvey),
              surveyTypeId: 1001, //@HACK: need better way of knowing the id of the survey type
            }),
            new CListInitialPaymentViewModel({
              pcontroller: _this,
              id: "initialpayment",
              title: "Initial Payment",
              isDone: ko.observable(_this.pulledCheckList.InitialPayment),
              layersVm: _this.layersVm,
            }),
            new CListSubmitOnlineViewModel({
              pcontroller: _this,
              id: "submitonline",
              title: "Submit Account Online",
              isDone: ko.observable(_this.pulledCheckList.SubmitAccountOnline),
              layersVm: _this.layersVm,
            }),
          ];
          _this.checklist(checkListArray);
        } else {
          notify.warn(resp.Message, null, 3);
        }
      }));

    }, join.add());
  };

  ChecklistViewModel.prototype.onActivate = function(routeCtx) { // overrides base
    var _this = this,
      routeData = routeCtx.routeData,
      routePart = _this.getChildRoutePart();

    if (!_this.qualifyVm.hasCustomer) {
      // // when there is no account, qualify is the only selectable child
      // routeData[routePart] = _this.qualifyVm.id;
    } else if (routeData[routePart]) {
      //@TODO: ensure the action is currently valid
    }
    ChecklistViewModel.super_.prototype.onActivate.call(_this, routeCtx);
  };

  function call_hasCustomer(masterId, setter, cb) {
    if (masterId <= 0) {
      setter(false);
      cb();
      return;
    }
    dataservice.qualify.customerMasterFiles.read({
      id: masterId,
      link: "hasCustomer",
    }, setter, cb);
  }

  return ChecklistViewModel;
});