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
      return _this.accounts(); //.concat(_this.agings());
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
      billingInfoCB = join.add();

    //@TODO: load real aging data
    _this.agings([
      createAging(_this, 'AgingID-1', 'Current', 169.97),
      createAging(_this, 'AgingID-2', '1 - 30', 0),
      createAging(_this, 'AgingID-3', '31 - 60', 0),
      createAging(_this, 'AgingID-4', '61 - 90', 0),
      createAging(_this, 'AgingID-5', '91 - 120', 0),
      createAging(_this, 'AgingID-6', '> 120', 0),
    ]);

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

  function createAging(pcontroller, id, title, amount) {
    return new ControllerViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: id,
      title: title,
      amount: amount,
    });
  }

  return MasterAccountViewModel;
});
