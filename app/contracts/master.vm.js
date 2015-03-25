define("src/contracts/master.vm", [
  "jquery",
  "src/contracts/contract.vm",
  "src/dataservice",
  "ko",
  "src/config",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
  // use to define ko.bindingHandlers.crg
  "src/account/default/runcredit.vm",
], function(
  jquery,
  ContractViewModel,
  dataservice,
  ko,
  config,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var customerTypePrecedence = {
    PRI: 1,
    LEAD: 1,
    SEC: 2,
    BILL: 3,
    SHIP: 4,
  };

  function sortByCustomerTypeId(a, b) {
    var aP = customerTypePrecedence[a.CustomerTypeId] || 9,
      bP = customerTypePrecedence[b.CustomerTypeId] || 9;
    return aP - bP;
  }

  function MasterViewModel(options) {
    var _this = this;
    MasterViewModel.super_.call(_this, options);
    utils.assertProps(_this, ["id", "title"]);

    _this.mayReload = ko.observable(false);
    _this.title = ko.observable(_this.title);
    _this.hideNav = ko.observable(config.crm.hideNav);

    _this.customers = ko.observableArray();

    _this.accounts = _this.childs;
    _this.paymentHistory = ko.observableArray();
    _this.totalRmr = ko.computed(function() {
      return _this.accounts().reduce(function(total, acct) {
        if (acct.hasRmr()) {
          return total + acct.rmr();
        }
        return total;
      }, 0);
    });

    //
    // events
    //
    _this.clickToggleNav = function() {
      _this.hideNav(!_this.hideNav());
    };
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickReload = function() {
      _this.reload();
    };
  }
  utils.inherits(MasterViewModel, ControllerViewModel);
  MasterViewModel.prototype.viewTmpl = "tmpl-contracts-master";

  MasterViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    call_hasCustomer(_this.id, function(hasCustomer) {
      if (!hasCustomer) {
        // close this tab
        _this.closeMsg = utils.noop; // allows closing
        _this.close();
        notify.info("No account, still a lead", null, 2);
        return;
      }

      load_customers(_this.id, function(data) {
        data.sort(sortByCustomerTypeId);
        _this.customers(data);

        load_billingInfoSummary(_this, _this.id, _this.accounts, join.add());
        load_billingHistory(_this, _this.id, join.add());
      }, join.add());
    }, join.add());

    join.when(function(err) {
      if (err) {
        //@TODO: mark _this as failed to load
        // ?? show dialog saying this view model needed to be reloaded ??
      }
    });
  };
  MasterViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    // just close if there is an error
    if (!_this.loadErr()) {
      // check if notesVm has a close msg
      msg = _this.notesVm.closeMsg();
      // get default close msg
      if (!msg) {
        msg = MasterViewModel.super_.prototype.closeMsg.call(_this);
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

  function load_billingInfoSummary(_this, masterId, accounts, cb) {
    dataservice.accountingengine.billingInfoSummary.read({
      id: masterId,
      link: "CMFID",
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        var list = resp.Value.map(function(acct) {
          return createContractVm(_this, acct.AccountId, acct.AccountName, acct.AmountDue, acct.NumberOfUnites);
        });
        accounts(list);
      } else {
        accounts([]);
      }
    }, utils.noop));
  }

  function load_billingHistory(_this, masterId, cb) {
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
      _this.paymentHistory(val);
    }, cb);
  }

  function createContractVm(_this, id, title, rmr, units) {
    return new ContractViewModel({
      layersVm: _this.layersVm,
      pcontroller: _this,
      id: id,
      title: title || "[Unknown]",
      rmr: rmr,
      units: units,
    });
  }

  return MasterViewModel;
});
