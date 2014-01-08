define('src/account/vm.masteraccount', [
  'src/dataservice',
  'src/account/vm.account',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  dataservice,
  AccountViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  var childRoutePart = 'id',
    agings = [
      'Current',
      '1 to 30',
      '31 to 60',
      '61 to 90',
      '91 to 120',
      '> 120',
    ];

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
      _this.selectChild(vm);
    };
  }
  utils.inherits(MasterAccountViewModel, ControllerViewModel);
  MasterAccountViewModel.prototype.viewTmpl = 'tmpl-masteraccount';

  MasterAccountViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      agingCB = join.add(),
      billingInfoCB = join.add();

    dataservice.accountingengine.billingInfoSummary.read({
      id: _this.id,
      link: 'CMFID',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          var list = resp.Value.map(function(acct) {
            return createAccount(_this, acct.AccountId, acct.AccountName, acct.AmountDue, acct.NumberOfUnites);
          });
          _this.accounts(list);
        } else {
          _this.accounts([]);
        }
      }, billingInfoCB);
    });

    dataservice.accountingengine.aging.read({
      id: _this.id,
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          var list, map = {};
          // make map for easy lookup
          resp.Value.forEach(function(aging) {
            map[aging.Age] = aging.Value;
          });
          // create view models in the expected order
          list = agings.map(function(name, index) {
            return createAging(_this, index, name, map[name]);
          });
          _this.agings(list);
        } else {
          _this.agings([]);
        }
      }, agingCB);
    });
  };

  function createAccount(pcontroller, id, title, rmr, units) {
    return new AccountViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: id,
      title: title,
      rmr: rmr,
      units: units,
    });
  }

  function createAging(pcontroller, index, title, amount) {
    return new ControllerViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: 'age' + index,
      index: index,
      title: title,
      amount: amount,
    });
  }

  return MasterAccountViewModel;
});
