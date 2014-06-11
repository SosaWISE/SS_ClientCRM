define('src/account/default/masteraccount.vm', [
  'src/account/default/notes.vm',
  'src/dataservice',
  'src/account/security/account.vm',
  'ko',
  'src/config',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  NotesViewModel,
  dataservice,
  AccountViewModel,
  ko,
  config,
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
    _this.hideNotes = ko.observable(config.accounts.hideNotes);
    _this.hideNav = ko.observable(config.accounts.hideNav);

    _this.customerData = ko.observable();

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

    _this.notesVm = new NotesViewModel({
      vm: _this,
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
    _this.clickReload = function() {
      _this.reload();
    };
    _this.clickNewAccount = function() {
      alert('I do nothing');
    };
  }
  utils.inherits(MasterAccountViewModel, ControllerViewModel);
  MasterAccountViewModel.prototype.viewTmpl = 'tmpl-acct-default-masteraccount';
  MasterAccountViewModel.prototype.reloadable = true;

  MasterAccountViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    load_customerInfoCard(_this.customerData, _this.id, function(err) {
      if (err) {
        cb(err);
        return;
      }

      _this.notesVm.load(routeData, extraData, function(err) {
        if (err) {
          cb(err);
          return;
        }

        load_billingInfoSummary(_this, _this.id, _this.accounts, join.add());
        load_aging(_this, _this.id, _this.agings, join.add());

        cb();
      });
    });

    join.when(function(err) {
      if (err) {
        //@TODO: mark _this as failed to load
        // ?? show dialog saying this view model needed to be reloaded ??
      }
    });
  };
  MasterAccountViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    // just close if there is an error
    if (!_this.loadErr()) {
      // check if notesVm has a close msg
      msg = _this.notesVm.closeMsg();
      // get default close msg
      if (!msg) {
        msg = MasterAccountViewModel.super_.prototype.closeMsg.call(_this);
      }
    }
    return msg;
  };

  function load_customerInfoCard(customerData, masterId, cb) {
    dataservice.accountingengine.customerCardInfos.read({
      id: masterId
    }, customerData, cb);
  }

  function load_billingInfoSummary(pcontroller, masterId, accounts, cb) {
    dataservice.accountingengine.billingInfoSummary.read({
      id: masterId,
      link: 'CMFID',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        var list = resp.Value.map(function(acct) {
          return createAccount(pcontroller, acct.AccountId, acct.AccountName, acct.AmountDue, acct.NumberOfUnites);
        });
        accounts(list);
      } else {
        accounts([]);
      }
    }, utils.no_op));
  }

  function load_aging(pcontroller, masterId, agings, cb) {
    dataservice.accountingengine.aging.read({
      id: masterId,
    }, null, utils.safeCallback(cb, function(err, resp) {
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
    }, utils.no_op));
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
