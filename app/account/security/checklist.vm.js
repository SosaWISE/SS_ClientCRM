define('src/account/security/checklist.vm', [
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

    _this.layersVm = new LayersViewModel();

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

  ChecklistViewModel.prototype.onLoad = function(routeData, join) {
    var _this = this;

    _this.checklist([
      new AccountQualifyViewModel({
        pcontroller: _this,
        id: 'qualify',
        title: 'Qualify Customer',
        layersVm: _this.layersVm,
      }),
      new SalesInfoViewModel({
        pcontroller: _this,
        id: 'salesinfo',
        title: 'Sales Info',
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
      {
        title: 'Initial Payment',
        active: ko.observable(false),
      },
      {
        title: 'Submit Account Online',
        active: ko.observable(false),
      },
    ]);


    join.add()();
  };
  ChecklistViewModel.prototype.onActivate = function(routeCtx) { // overrides base
    var _this = this;
    if (routeCtx.routeData.tab) {
      //@TODO: ensure the action is currently valid
    }
    // call base
    ChecklistViewModel.super_.prototype.onActivate.call(_this, routeCtx);

    // // this timeout makes it possible to focus the input
    // setTimeout(function() {
    //   _this.focus(true);
    // }, 100);
  };

  return ChecklistViewModel;
});
