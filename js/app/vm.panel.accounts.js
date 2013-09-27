define([
  'notify',
  'utils',
  'vm.controller',
  'vm.account.new',
  'vm.account'
], function(
  notify,
  utils,
  ControllerViewModel,
  NewAccountViewModel,
  AccountViewModel
) {
  "use strict";

  function AccountsPanelViewModel(options) {
    var _this = this;
    AccountsPanelViewModel.super_.call(_this, options);

    _this.list([
      new AccountViewModel({
        id: 100001,
        title: '100001',
      }),
      new AccountViewModel({
        id: 100002,
        title: '100002',
      }),
      new AccountViewModel({
        id: 100003,
        title: '100003',
      }),
      new NewAccountViewModel({
        id: 0,
        title: '+',
      }),
    ]);

    //
    // events
    //
    _this.clickItem = function(model) {
      _this.selectItem(model);
    };

    //TESTING
    _this.clickItem(_this.list()[0]);
    //TESTING
  }
  utils.inherits(AccountsPanelViewModel, ControllerViewModel);

  AccountsPanelViewModel.prototype.onLoad = function(cb) { // overrides base
    cb(false);
  };
  AccountsPanelViewModel.prototype.onActivate = function() { // overrides base
    this.setTitle(this.name);
  };

  AccountsPanelViewModel.prototype.selectItem = function(model) {
    if (this.activeChild) {
      this.activeChild.deactivate();
    }
    this.activeChild = model;
    this.activeChild.activate();

    // this.setRouteData({
    //   panel: this.id,
    //   id: this.activeChild.id,
    // });
  };

  return AccountsPanelViewModel;
});
