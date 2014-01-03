define('src/account/vm.masteraccount', [
  'src/account/vm.account',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  AccountViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  var childRoutePart = 'accountid';

  function MasterAccountViewModel(options) {
    var _this = this;
    MasterAccountViewModel.super_.call(_this, options);
    _this.ensureProps(['id', 'title']);

    _this.title = ko.observable(_this.title);
    _this.hideNotes = ko.observable(false);
    _this.hideNav = ko.observable(false);

    _this.accounts = ko.observableArray();
    _this.agings = ko.observableArray();
    // override childs array from ControllerViewModel
    _this.childs = ko.computed(function() {
      return _this.accounts().concat(_this.agings());
    });
    _this.totalRmr = ko.computed(function() {
      return _this.accounts().reduce(function(total, acct) {
        if (acct.hasRmr()) {
          return total + acct.rmr();
        }
        return total;
      }, 0);
    });
    _this.totalAging = ko.computed(function() {
      return _this.agings().reduce(function(total, aging) {
        return total + aging.amount;
      }, 0);
    });

    //
    // events
    //
    _this.clickToggleNotes = function() {
      _this.hideNotes(!_this.hideNotes());
    };
    _this.clickToggleNav = function() {
      _this.hideNav(!_this.hideNav());
    };
    _this.clickItem = function(vm) {
      _this.setActiveChild(vm);
    };
  }
  utils.inherits(MasterAccountViewModel, ControllerViewModel);
  MasterAccountViewModel.prototype.viewTmpl = 'tmpl-masteraccount';

  MasterAccountViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      _this.accounts([
        createAccount(_this, 101000, 'S1', 49.99, true),
        createAccount(_this, 101010, 'LifeLock', 0, true),
        createAccount(_this, 101020, 'S2', 49.99, true),
        createAccount(_this, 101030, 'Numana', 59.99, true),
        createAccount(_this, 101040, 'Window Film', null, false),
        createAccount(_this, 101050, 'Strike Plate', null, false),
        createAccount(_this, 101060, 'Internet Security', 10.00, true),
      ]);
      _this.agings([
        createAging('Current', 169.97),
        createAging('1 - 30', 0),
        createAging('31 - 60', 0),
        createAging('61 - 90', 0),
        createAging('91 - 120', 0),
        createAging('> 120', 0),
      ]);

      cb();
    }, 0);
  };
  // MasterAccountViewModel.prototype.selectItem = function(vm) {
  //   var _this = this;
  //   _this.goTo(vm.getLastRouteData() || {
  //     masterid: _this.id,
  //     accountid: vm.id,
  //   });
  // };

  function createAccount(pcontroller, id, title, rmr, hasRmr) {
    return new AccountViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: id,
      title: title,
      rmr: rmr,
      hasRmr: hasRmr,
    });
  }

  function createAging(title, amount) {
    return new ControllerViewModel({
      title: title,
      amount: amount,
    });
  }

  return MasterAccountViewModel;
});
