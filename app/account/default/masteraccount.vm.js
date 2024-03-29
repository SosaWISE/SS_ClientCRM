define("src/account/default/masteraccount.vm", [
  "src/account/default/notes.vm",
  "dataservice",
  "src/account/security/account.vm",
  "ko",
  "howie",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  NotesViewModel,
  dataservice,
  AccountViewModel,
  ko,
  howie,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var agingList = [
    "Current",
    "1 to 30",
    "31 to 60",
    "61 to 90",
    "91 to 120",
    "> 120",
  ];
  var customerTypePrecedence = {
    PRI: 1,
    LEAD: 1,
    SEC: 2,
    MONI: 3,
    BILL: 4,
    SHIP: 5,
  };

  function sortByCustomerTypeId(a, b) {
    var aP = customerTypePrecedence[a.CustomerTypeId] || 9,
      bP = customerTypePrecedence[b.CustomerTypeId] || 9;
    return aP - bP;
  }

  function MasterAccountViewModel(options) {
    var _this = this;
    MasterAccountViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "id",
      "title",
    ]);

    _this.mayReload = ko.observable(false);
    _this.title = ko.observable(_this.title);
    _this.hideNotes = ko.observable(howie.fetch("config").crm.hideNotes);
    _this.hideNav = ko.observable(howie.fetch("config").crm.hideNav);

    _this.customers = ko.observableArray();

    _this.accounts = ko.observableArray();
    _this.paymentHistory = ko.observableArray();
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
      ownerVm: _this,
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
      window.alert("I do nothing");
    };

    _this.vms = [ // nested view models
      _this.notesVm,
    ];
  }
  utils.inherits(MasterAccountViewModel, ControllerViewModel);
  MasterAccountViewModel.prototype.viewTmpl = "tmpl-acct-default-masteraccount";

  MasterAccountViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    call_hasCustomer(_this.id, function(hasCustomer) {
      if (!hasCustomer) {
        // close this tab
        _this.closeMsg = utils.noop; // allows closing
        _this.close();
        // then redirect to lead
        _this.goTo({
          route: "leads",
          masterid: _this.id,
        });
        notify.info("Redirected to lead", null, 2);
        // we are done here
        return;
      }

      load_customers(_this.id, function(data) {
        data.sort(sortByCustomerTypeId);
        _this.customers(data);

        _this.notesVm.load(routeData, extraData, utils.safeCallback(join.add(), function() {
          load_billingInfoSummary(_this, _this.id, _this.accounts, join.add());
          load_billingHistory(_this, _this.id, join.add());
          load_aging(_this, _this.id, _this.agings, join.add());
        }, utils.noop));
      }, join.add());
    }, join.add());

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

  function call_hasCustomer(masterId, setter, cb) {
    dataservice.qualify.customerMasterFiles.read({
      id: masterId,
      link: "hasCustomer",
    }, setter, cb);
  }

  function load_customers(masterId, setter, cb) {
    dataservice.qualify.customerMasterFiles.read({
      id: masterId,
      link: "customers",
    }, setter, cb);
  }

  function load_billingInfoSummary(pcontroller, masterId, accounts, cb) {
    dataservice.accountingengine.billingInfoSummary.read({
      id: masterId,
      link: "CMFID",
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        var list = resp.Value.map(function(acct) {
          return createAccount(pcontroller, acct.AccountId, acct.AccountName, acct.AmountDue, acct.NumberOfUnites);
        });
        accounts(list);
      } else {
        accounts([]);
      }
    }, utils.noop));
  }

  function load_billingHistory(pcontroller, masterId, cb) {
    dataservice.accountingengine.billingHistory.read({
      id: masterId,
      link: "CMFID",
    }, function(val) {
      val.forEach(function(item) {
        if (item.BillingType === "Invoice" && item.BillingAmount > 0) {
          // make invoices negative
          item.BillingAmount *= -1;
        }
      });
      pcontroller.paymentHistory(val);
    }, cb);
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
    }, utils.noop));
  }

  function createAccount(pcontroller, id, title, rmr, units) {
    return new AccountViewModel({
      pcontroller: pcontroller,
      id: id,
      title: title || "[Unknown]",
      rmr: rmr,
      units: units,
    });
  }

  function createAging(pcontroller, index, title, amount) {
    return new ControllerViewModel({
      pcontroller: pcontroller,
      id: "age" + index,
      index: index,
      title: title,
      amount: amount,
    });
  }

  return MasterAccountViewModel;
});
