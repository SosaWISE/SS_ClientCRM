define([
  'notify',
  'util/utils',
  'vm.controller',
  'vm.account.search',
  'vm.account.new',
  // 'vm.account'
  'vm.rep.find'
], function(
  notify,
  utils,
  ControllerViewModel,
  SearchAccountViewModel,
  NewAccountViewModel,
  AccountViewModel
) {
  "use strict";

  function AccountsPanelViewModel(options) {
    var _this = this;
    AccountsPanelViewModel.super_.call(_this, options);

    _this.childName = 'id';
    _this.defaultChild = 'search';
    _this.extraRouteData = ['action'];

    _this.searchVM = new SearchAccountViewModel({
      id: 'search',
      title: 'Search',
    });

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
        id: 'new',
        title: '+',
      }),
    ]);

    //
    // events
    //
    _this.clickSearch = function() {
      _this.selectItem(_this.searchVM);
    };
    _this.clickItem = function(vm) {
      _this.selectItem(vm);
    };
    _this.clickAddItem = function() {
      var vm = new AccountViewModel({
        id: 0,
        title: 'New Account',
      });
      _this.list.splice(_this.list().length - 1, 0, vm);
      // _this.list.push(vm);
      _this.selectItem(vm);
    };
  }
  utils.inherits(AccountsPanelViewModel, ControllerViewModel);

  AccountsPanelViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this,
      vm;
    /* jshint eqeqeq:false */
    if (routeData.id && parseInt(routeData.id, 10) == routeData.id) {
      vm = this.findChild(routeData.id);
      if (!vm) {
        vm = new AccountViewModel({
          id: parseInt(routeData.id, 10),
          title: routeData.id,
        });
        _this.list.splice(_this.list().length - 1, 0, vm);
        //@TODO: load account asynchronously
        cb(false);
        return;
      }
    }
    cb(false);
  };
  AccountsPanelViewModel.prototype.findChild = function(id) {
    var _this = this,
      result;
    if (id === _this.searchVM.id) {
      result = _this.searchVM;
    } else {
      result = AccountsPanelViewModel.super_.prototype.findChild.call(this, id);
    }
    return result;
  };
  AccountsPanelViewModel.prototype.onActivate = function(routeData) { // overrides base
    var child = this.findChild(routeData[this.childName]);
    if (!child) {
      this.removeExtraRouteData(routeData);
      child = this.findChild(this.defaultChild);
    }
    routeData[this.childName] = child.id;

    child.activate(routeData);
    this.activeChild = child;

    this.setTitle(child.name);
  };

  AccountsPanelViewModel.prototype.selectItem = function(vm) {
    if (this.activeChild) {
      this.activeChild.deactivate();
    }
    this.activeChild = vm;
    this.activeChild.activate();

    var id;
    if (vm instanceof SearchAccountViewModel) {
      id = "search";
    } else if (vm instanceof NewAccountViewModel) {
      id = "new";
    } else {
      id = vm.id;
    }
    this.setRouteData({
      route: this.id,
      id: id,
    });
  };

  return AccountsPanelViewModel;
});
