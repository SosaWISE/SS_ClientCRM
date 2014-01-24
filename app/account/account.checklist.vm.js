define('src/account/account.checklist.vm', [
  'src/core/layers.vm',
  'src/account/account.qualify.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko',
], function(
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

    _this.checklist = _this.childs;

    _this.layersVM = new LayersViewModel();

    //
    // events
    //
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

  AccountChecklistViewModel.prototype.selectItem = function(vm) {
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

  return AccountChecklistViewModel;
});
