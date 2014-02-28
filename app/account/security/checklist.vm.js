define('src/account/security/checklist.vm', [
  'src/account/default/initialpayment.vm',
  'src/account/security/survey.vm',
  'src/account/security/systemdetails.vm',
  'src/account/security/industrynums.vm',
  'src/account/security/salesinfo.vm',
  'src/account/security/account.qualify.vm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko',
], function(
  InitialPaymentViewModel,
  SurveyViewModel,
  SystemDetailsViewModel,
  IndustryViewModel,
  SalesInfoViewModel,
  AccountQualifyViewModel,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  function ChecklistViewModel(options) {
    var _this = this;
    ChecklistViewModel.super_.call(_this, options);

    _this.checklist = _this.childs;

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.qualifyVm = new AccountQualifyViewModel({
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
      new SalesInfoViewModel({
        pcontroller: _this,
        id: 'salesinfo',
        title: 'Sales Info',
        layersVm: _this.layersVm,
      }),
      new SurveyViewModel({
        pcontroller: _this,
        id: 'presurvey',
        title: 'Pre Survey',
      }),
      new IndustryViewModel({
        pcontroller: _this,
        id: 'industrynums',
        title: 'Industry #\'s',
      }),
      new SystemDetailsViewModel({
        pcontroller: _this,
        id: 'systemdetails',
        title: 'System Details',
        layersVm: _this.layersVm,
      }),
      {
        title: 'System Test',
        // title: 'Signal/TwoWay Check',
        active: ko.observable(false),
      },
      // {
      //   title: 'Tech Inspection',
      //   active: ko.observable(false),
      // },
      new SurveyViewModel({
        pcontroller: _this,
        id: 'techinspection',
        title: 'Tech Inspection',
      }),
      new SurveyViewModel({
        pcontroller: _this,
        id: 'postsurvey',
        title: 'Post Survey',
      }),
      new InitialPaymentViewModel({
        pcontroller: _this,
        id: 'initialpayment',
        title: 'Initial Payment',
        layersVm: _this.layersVm,
      }),
      {
        title: 'Submit Account Online',
        active: ko.observable(false),
      },
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
