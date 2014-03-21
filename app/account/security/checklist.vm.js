define('src/account/security/checklist.vm', [
  'ko',
  'src/account/security/clist.qualify.vm',
  'src/account/security/clist.salesinfo.vm',
  'src/account/security/clist.survey.vm',
  'src/account/security/clist.industrynums.vm',
  'src/account/security/clist.emcontacts.vm',
  'src/account/security/clist.systemdetails.vm',
  'src/account/security/clist.registercell.vm',
  'src/account/security/clist.systemtest.vm',
  'src/account/security/clist.initialpayment.vm',
  'src/account/security/clist.submitonline.vm',
  'src/core/layers.vm',
  'src/core/notify', 'src/core/utils', 'src/core/controller.vm',
], function(
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

    _this.checklist = _this.childs;

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.qualifyVm = new CListQualifyViewModel({
      pcontroller: _this,
      id: 'qualify',
      title: 'Qualify Customer',
      layersVm: _this.layersVm,
      canCreateAccount: true,
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
  ChecklistViewModel.prototype.viewTmpl = 'tmpl-security-checklist';

  ChecklistViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    _this.checklist([
      _this.qualifyVm,
      new CListSalesInfoViewModel({
        pcontroller: _this,
        id: 'salesinfo',
        title: 'Sales Info',
        layersVm: _this.layersVm,
      }),
      new CListSurveyViewModel({
        pcontroller: _this,
        id: 'presurvey',
        title: 'Pre Survey',
      }),
      new CListIndustryViewModel({
        pcontroller: _this,
        id: 'industrynums',
        title: 'Industry #\'s',
      }),
      new CListEmcontactsViewModel({
        pcontroller: _this,
        id: 'emcontacts',
        title: 'Emergency Contacts',
        layersVm: _this.layersVm,
      }),
      new CListSystemDetailsViewModel({
        pcontroller: _this,
        id: 'systemdetails',
        title: 'System Details',
        layersVm: _this.layersVm,
      }),
      new CListRegisterCellViewModel({
        pcontroller: _this,
        id: 'registercell',
        title: 'Register Cell',
        layersVm: _this.layersVm,
      }),
      new CListSystemTestViewModel({
        pcontroller: _this,
        id: 'systemtest',
        title: 'System Test',
        layersVm: _this.layersVm,
      }),
      // for now we're not doing Tech inspections
      // new CListSurveyViewModel({
      //   pcontroller: _this,
      //   id: 'techinspection',
      //   title: 'Tech Inspection',
      // }),
      new CListSurveyViewModel({
        pcontroller: _this,
        id: 'postsurvey',
        title: 'Post Survey',
      }),
      new CListInitialPaymentViewModel({
        pcontroller: _this,
        id: 'initialpayment',
        title: 'Initial Payment',
        layersVm: _this.layersVm,
      }),
      new CListSubmitOnlineViewModel({
        pcontroller: _this,
        id: 'submitonline',
        title: 'Submit Account Online',
        layersVm: _this.layersVm,
      }),
    ]);


    join.add()();
  };

  ChecklistViewModel.prototype.onActivate = function(routeCtx) { // overrides base
    var _this = this,
      routeData = routeCtx.routeData,
      routePart = _this.getChildRoutePart();

    if (_this.qualifyVm.canCreateAccount) {
      // // when there is no account, qualify is the only selectable child
      // routeData[routePart] = _this.qualifyVm.id;
    } else if (routeData[routePart]) {
      //@TODO: ensure the action is currently valid
    }
    ChecklistViewModel.super_.prototype.onActivate.call(_this, routeCtx);
  };

  return ChecklistViewModel;
});
