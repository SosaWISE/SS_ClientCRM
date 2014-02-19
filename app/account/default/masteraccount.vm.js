define('src/account/default/masteraccount.vm', [
  'src/account/default/notes.vm',
  'src/dataservice',
  'src/account/security/account.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  NotesViewModel,
  dataservice,
  AccountViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var agingList = [
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
    ControllerViewModel.ensureProps(_this, ['id', 'title']);

    _this.title = ko.observable(_this.title);
    _this.hideNotes = ko.observable(false);
    _this.hideNav = ko.observable(false);
    _this.hideNav(true);

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

    _this.notesVM = new NotesViewModel({
      id: _this.id,
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
  MasterAccountViewModel.prototype.viewTmpl = 'tmpl-acct-default-masteraccount';

  MasterAccountViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    _this.notesVM.load(routeData, extraData, function(err) {
      if (!err) {
        load_billingInfoSummary(_this, _this.id, _this.accounts, join.add());
        load_aging(_this, _this.id, _this.agings, join.add());
      }
      cb(err);
    });

    join.when(function(err) {
      if (err) {
        //@TODO: mark _this as failed to load
        // ?? show dialog saying this view model needed to be reloaded ??
      }
    });
  };

  function load_billingInfoSummary(pcontroller, masterId, accounts, cb) {
    dataservice.accountingengine.billingInfoSummary.read({
      id: masterId,
      link: 'CMFID',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          var list = resp.Value.map(function(acct) {
            return createAccount(pcontroller, acct.AccountId, acct.AccountName, acct.AmountDue, acct.NumberOfUnites);
          });
          accounts(list);
        } else {
          accounts([]);
        }
      }, cb);
    });
  }

  function load_aging(pcontroller, masterId, agings, cb) {
    dataservice.accountingengine.aging.read({
      id: masterId,
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          var list, map = {};
          // make map for easy lookup
          resp.Value.forEach(function(aging) {
            map[aging.Age] = aging.Value;
          });
          // create view models in the expected order
          list = agingList.map(function(name, index) {
            return createAging(pcontroller, index, name, map[name]);
          });
          agings(list);
        } else {
          agings([]);
        }
      }, cb);
    });
  }

  function createAccount(pcontroller, id, title, rmr, units) {
    return new AccountViewModel({
      pcontroller: pcontroller,
      id: id,
      title: title || '[Unknown]',
      rmr: rmr,
      units: units,
    });
  }

  function createAging(pcontroller, index, title, amount) {
    return new ControllerViewModel({
      pcontroller: pcontroller,
      id: 'age' + index,
      index: index,
      title: title,
      amount: amount,
    });
  }

  return MasterAccountViewModel;
});
