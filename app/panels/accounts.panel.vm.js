define('src/panels/accounts.panel.vm', [
  'src/core/helpers',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  helpers,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  // lazy load account dependencies
  var deps = {},
    ensureDeps = helpers.onetimer(function loadDeps(cb) {
      require([
        'src/account/default/masteraccount.vm',
        'src/account/default/search.vm',
        'src/account/security/checklist.vm',
        'src/account/security/account.info.vm',
      ], function() {
        var args = arguments;
        deps.MasterAccountViewModel = args[0];
        deps.AccountSearchViewModel = args[1];
        deps.ChecklistViewModel = args[2];
        deps.AccountInfoViewModel = args[3];
        cb();
      });
    }),
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
      // var vm = createAccountVM(0, 'New Account');
      // _this.list.push(vm);
      // _this.selectChild(vm);
    };
    _this.clickNew = function() {
      newCount--; // negative number are unsaved leads
      // the negative number adds a dash before Qualify which seems to work
      var vm = createChecklistVM(_this, newCount, 'Qualify' + newCount);
      _this.list.push(vm);
      _this.selectChild(vm);
    };
  }
  utils.inherits(AccountsPanelViewModel, ControllerViewModel);
  // AccountsPanelViewModel.prototype.routePart = '';

  AccountsPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    ensureDeps(function() {
      _this.searchVM = new deps.AccountSearchViewModel({
        routeName: 'accounts',
        pcontroller: _this,
        id: 'search',
        title: 'Search',
      });
      _this.defaultChild = _this.searchVM;

      // ////////////////TESTING//////////////////////////////////
      // _this.list([
      //   createAccountVM(_this, 3000001, '3000001'),
      //   new deps.AccountInfoViewModel({
      //     pcontroller: _this,
      //     id: 3000002,
      //     title: '3000002',
      //     name: '3000002',
      //   }),
      //   createAccountVM(_this, 3000003, '3000003'),
      //   new deps.AccountInfoViewModel({
      //     pcontroller: _this,
      //     id: 123,
      //     title: '123',
      //     name: '123',
      //   }),
      // ]);
      // ////////////////TESTING//////////////////////////////////

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
        // get child id
        id = routeData[_this.getChildRoutePart(routeData.route)];
        /* jshint eqeqeq:false */
        if (typeof(id) !== 'undefined' && parseInt(id, 10) == id && id > 0) {
          if (routeData.route === 'leads') {
            // create child and add to list
            result = createChecklistVM(_this, parseInt(id, 10), strings.format('{0}(Lead)', id));
          } else {
            result = createMasterAccountVM(_this, parseInt(id, 10), id + '');
          }
          _this.list.push(result);
        }
      }
    }
    return result;
  };

  function createMasterAccountVM(pcontroller, id, name) {
    return new deps.MasterAccountViewModel({
      routeName: 'accounts',
      pcontroller: pcontroller,
      id: id,
      title: name,
      name: name,
    });
  }

  function createChecklistVM(pcontroller, id, name) {
    return new deps.ChecklistViewModel({
      routeName: 'leads',
      pcontroller: pcontroller,
      id: id,
      title: name,
    });
  }

  return AccountsPanelViewModel;
});
