define('src/panels/accounts.panel.vm', [
  'src/core/helpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
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
        'src/account/masteraccount.vm',
        'src/account/account.search.vm',
        'src/account/account.checklist.vm',
        'src/account/account.info.vm',
        'src/scrum/scrum.panel.vm',
      ], function() {
        var args = arguments;
        deps.MasterAccountViewModel = args[0];
        deps.AccountSearchViewModel = args[1];
        deps.AccountChecklistViewModel = args[2];
        deps.AccountInfoViewModel = args[3];
        deps.ScrumPanelViewModel = args[4];
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
      var vm = new deps.AccountChecklistViewModel({
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
      cb = join.add();

    ensureDeps(function() {
      _this.searchVM = new deps.AccountSearchViewModel({
        pcontroller: _this,
        routePart: childRoutePart,
        id: 'search',
        title: 'Search',
      });
      _this.defaultChild = _this.searchVM;

      ////////////////TESTING//////////////////////////////////
      _this.list([
        createAccountVM(_this, 3000001, '3000001'),
        new deps.AccountInfoViewModel({
          pcontroller: _this,
          routePart: childRoutePart,
          id: 3000002,
          title: '3000002',
          name: '3000002',
        }),
        createAccountVM(_this, 3000003, '3000003'),
        new deps.ScrumPanelViewModel({
          pcontroller: _this,
          routePart: childRoutePart,
          id: 2,
          title: '2',
          name: '2',
        }),
      ]);
      ////////////////TESTING//////////////////////////////////

      cb();
    });
  };

  AccountsPanelViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result, id;
    if (routeData[_this.searchVM.routePart] === _this.searchVM.id) {
      result = _this.searchVM;
    } else {
      result = AccountsPanelViewModel.super_.prototype.findChild.call(_this, routeData);
      if (!result) {
        // create child and add to list
        id = routeData[childRoutePart];
        /* jshint eqeqeq:false */
        if (typeof(id) !== 'undefined' && parseInt(id, 10) == id) {
          result = createAccountVM(_this, parseInt(id, 10), id + '');
          _this.list.push(result);
        }
      }
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
