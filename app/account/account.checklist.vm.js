define('src/account/account.checklist.vm', [
  'src/account/security/survey.vm',
  'src/account/security/systemdetails.vm',
  'src/account/security/industrynums.vm',
  'src/account/security/salesinfo.vm',
  'src/core/layers.vm',
  'src/account/account.qualify.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko',
], function(
  SurveyViewModel,
  SystemDetailsViewModel,
  IndustryViewModel,
  SalesInfoViewModel,
  LayersViewModel,
  AccountQualifyViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  function AccountChecklistViewModel(options) {
    var _this = this;
    AccountChecklistViewModel.super_.call(_this, options);

    _this.childRoutePart = (_this.routePart === 'masterid') ? 'id' : 'sub';

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
  utils.inherits(AccountChecklistViewModel, ControllerViewModel);
  AccountChecklistViewModel.prototype.viewTmpl = 'tmpl-account_checklist';

  AccountChecklistViewModel.prototype.onLoad = function(routeData, join) {
    var _this = this;

    _this.checklist([
      new AccountQualifyViewModel({
        pcontroller: _this,
        routePart: _this.childRoutePart,
        id: 'qualify',
        title: 'Qualify Customer',
        layersVm: _this.layersVm,
      }),
      new SalesInfoViewModel({
        pcontroller: _this,
        routePart: _this.childRoutePart,
        id: 'salesinfo',
        title: 'Sales Info',
      }),
      new SurveyViewModel({
        pcontroller: _this,
        routePart: _this.childRoutePart,
        id: 'presurvey',
        title: 'Pre Survey',
      }),
      new IndustryViewModel({
        pcontroller: _this,
        routePart: _this.childRoutePart,
        id: 'industrynums',
        title: 'Industry #\'s',
      }),
      new SystemDetailsViewModel({
        pcontroller: _this,
        routePart: _this.childRoutePart,
        id: 'systemdetails',
        title: 'System Details',
        layersVm: _this.layersVm,
      }),
      {
        title: 'Signal/TwoWay Check',
        active: ko.observable(false),
      },
      {
        title: 'Tech Inspection',
        active: ko.observable(false),
      },
      new SurveyViewModel({
        pcontroller: _this,
        routePart: _this.childRoutePart,
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
  AccountChecklistViewModel.prototype.onActivate = function(routeCtx) { // overrides base
    var _this = this;
    if (routeCtx.routeData.tab) {
      //@TODO: ensure the action is currently valid
    }
    // call base
    AccountChecklistViewModel.super_.prototype.onActivate.call(_this, routeCtx);

    // // this timeout makes it possible to focus the input
    // setTimeout(function() {
    //   _this.focus(true);
    // }, 100);
  };

  return AccountChecklistViewModel;
});
