define('src/vm.panel.accounts', [
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
  'src/vm.account.search',
  'src/vm.account.new',
  'src/vm.account'
], function(
  notify,
  utils,
  ControllerViewModel,
  SearchAccountViewModel,
  NewAccountViewModel,
  AccountViewModel
) {
  "use strict";

  var childRoutePart = 'accountid';

  function AccountsPanelViewModel(options) {
    var _this = this;
    AccountsPanelViewModel.super_.call(_this, options);

    // _this.childName = 'id';
    // _this.defaultChild = 'search';
    // _this.extraRouteData = ['action'];

    _this.searchVM = new SearchAccountViewModel({
      routePart: childRoutePart,
      id: 'search',
      title: 'Search',
    });

    _this.list = _this.childs;
    _this.list([
      createAccountVM(100001, '100001'),
      createAccountVM(100002, '100002'),
      createAccountVM(100003, '100003'),
      new NewAccountViewModel({
        routePart: childRoutePart,
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
      var vm = createAccountVM(0, 'New Account');
      _this.list.splice(_this.list().length - 1, 0, vm);
      // _this.list.push(vm);
      _this.selectItem(vm);
    };

    _this.defaultChild = _this.searchVM;
  }
  utils.inherits(AccountsPanelViewModel, ControllerViewModel);
  // AccountsPanelViewModel.prototype.routePart = '';

  AccountsPanelViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      id = routeData[childRoutePart],
      vm;
    /* jshint eqeqeq:false */
    if (id && parseInt(id, 10) == id) {
      vm = _this.findChild(routeData);
      if (!vm) {
        vm = createAccountVM(parseInt(id, 10), id);
        _this.list.splice(_this.list().length - 1, 0, vm);
      }
    }
    join.add()();
  };

  AccountsPanelViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result;
    if (routeData[_this.searchVM.routePart] === _this.searchVM.id) {
      result = _this.searchVM;
    } else {
      result = AccountsPanelViewModel.super_.prototype.findChild.call(_this, routeData);
    }
    return result;
  };

  AccountsPanelViewModel.prototype.selectItem = function(vm) {
    var _this = this,
      id;

    if (vm instanceof SearchAccountViewModel) {
      id = "search";
    } else if (vm instanceof NewAccountViewModel) {
      id = "new";
    } else {
      id = vm.id;
    }
    _this.goTo({
      route: _this.id,
      accountid: id,
    });
  };

  function createAccountVM(id, name) {
    return new AccountViewModel({
      routePart: childRoutePart,
      id: id,
      title: name,
      name: name,
    });
  }

  return AccountsPanelViewModel;
});
