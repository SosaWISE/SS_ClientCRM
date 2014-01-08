define('src/account/vm.account.checklist', [
  'src/core/vm.layers',
  'src/account/vm.account.qualify',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko',
], function(
  LayersViewModel,
  QualifyAccountViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  function ChecklistAccountViewModel(options) {
    var _this = this;
    ChecklistAccountViewModel.super_.call(_this, options);

    _this.checklist = _this.childs;

    _this.layersVM = new LayersViewModel();

    //
    // events
    //
    // _this.cmd = ko.command(function(cb) {
    //   cb();
    // });
  }
  utils.inherits(ChecklistAccountViewModel, ControllerViewModel);
  ChecklistAccountViewModel.prototype.viewTmpl = 'tmpl-account_checklist';

  ChecklistAccountViewModel.prototype.onLoad = function(routeData, join) {
    var _this = this;

    _this.checklist([
      new QualifyAccountViewModel({
        routePart: 'tab',
        id: 'qualify',
        title: 'Qualify',
        layersVM: _this.layersVM,
      }),
      {
        title: 'Pre Survey',
        complete: ko.observable(false),
        active: ko.observable(false),
      },
      {
        title: 'Industry #\'s',
        complete: ko.observable(false),
        active: ko.observable(false),
      },
      {
        title: 'etc.',
        complete: ko.observable(false),
        active: ko.observable(false),
      },
    ]);


    join.add()();
  };
  ChecklistAccountViewModel.prototype.onActivate = function(routeCtx) { // overrides base
    var _this = this;
    if (routeCtx.routeData.tab) {
      //@TODO: ensure the action is currently valid
    }
    // call base
    ChecklistAccountViewModel.super_.prototype.onActivate.call(_this, routeCtx);

    // // this timeout makes it possible to focus the input
    // setTimeout(function() {
    //   _this.focus(true);
    // }, 100);
  };

  ChecklistAccountViewModel.prototype.selectItem = function(vm) {
    var _this = this;
    _this.onDeactivate();
    if (_this.activeChild() !== vm) {
      _this.activeChild(vm);
    }

    _this.goTo({
      masterid: _this.id,
      id: _this.id,
      tab: vm.id,
    });
  };

  return ChecklistAccountViewModel;
});
