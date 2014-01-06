define('src/panels/vm.panel.accounts', [
  'src/core/helpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
], function(
  helpers,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  // lazy load account dependencies
  var deps = {},
    ensureDeps = helpers.onetimer(function loadDeps(cb) {
      require([
        'src/account/vm.account.search',
        'src/account/vm.account.checklist',
        'src/account/vm.masteraccount',
        'src/account/vm.account.info',
      ], function() {
        var args = arguments;
        deps.SearchAccountViewModel = args[0];
        deps.ChecklistAccountViewModel = args[1];
        deps.MasterAccountViewModel = args[2];
        deps.InfoAccountViewModel = args[3];
        cb();
      });
    }),
    childRoutePart = 'masterid',
    newCount = 0;

  function AccountsPanelViewModel(options) {
    var _this = this;
    AccountsPanelViewModel.super_.call(_this, options);

    _this.list = _this.childs;

    //
    // events
    //
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVM);
    };
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickAddItem = function() {
      var vm = createAccountVM(0, 'New Account');
      _this.list.push(vm);
      _this.selectChild(vm);
    };
    _this.clickNew = function() {
      newCount++;
      var vm = new deps.ChecklistAccountViewModel({
        pcontroller: _this,
        routePart: childRoutePart,
        id: 'new' + newCount,
        title: 'New ' + newCount,
      });
      _this.list.push(vm);
      _this.selectChild(vm);
    };
  }
  utils.inherits(AccountsPanelViewModel, ControllerViewModel);
  // AccountsPanelViewModel.prototype.routePart = '';

  AccountsPanelViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      id = routeData[childRoutePart],
      cb = join.add(),
      vm;

    ensureDeps(function() {
      _this.searchVM = new deps.SearchAccountViewModel({
        pcontroller: _this,
        routePart: childRoutePart,
        id: 'search',
        title: 'Search',
      });
      _this.defaultChild = _this.searchVM;

      _this.list([
        createAccountVM(_this, 100001, '100001'),
        new deps.InfoAccountViewModel({
          pcontroller: _this,
          routePart: childRoutePart,
          id: 100002,
          title: '100002',
          name: '100002',
        }),
        createAccountVM(_this, 100003, '100003'),
      ]);

      /* jshint eqeqeq:false */
      if (id && parseInt(id, 10) == id) {
        vm = _this.findChild(routeData);
        if (!vm) {
          vm = createAccountVM(_this, parseInt(id, 10), id + '');
          _this.list.push(vm);
        }
      }
      cb();
    });
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

  function createAccountVM(pcontroller, id, name) {
    return new deps.MasterAccountViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: id,
      title: name,
      name: name,
    });
  }

  return AccountsPanelViewModel;
});
