define("src/contracts/contract.vm", [
  "src/account/default/search.vm",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  SearchViewModel,
  dataservice,
  ukov,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var priTitle = "Primary Customer";
  var secTitle = "Secondary Customer";

  function ContractViewModel(options) {
    var _this = this;
    ContractViewModel.super_.call(_this, options);

    _this.list = _this.childs;
    _this.mayReload = ko.observable(false);
    _this.showNav = ko.observable(true); // && config.contracts.showNav);

    _this.rmr = ko.observable(_this.rmr);
    _this.hasRmr = ko.observable(_this.rmr() != null);

    _this.models = {
      customers: ko.observableArray([{
        title: priTitle,
        CustomerTypeId: "",
      }, {
        title: secTitle,
        CustomerTypeId: "",
      }]),
      premiseAddress: ko.observable(),
      contractTerms: ko.observable(),
      systemDetails: ko.observable(),
      accountDetails: ko.observable(),
      holds: ko.observable(),
    };

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(ContractViewModel, ControllerViewModel);
  ContractViewModel.prototype.viewTmpl = "tmpl-contracts-contract";

  ContractViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    // set primary customer
    load_accountCustomer(_this.id, "PRI", function(val) {
      val = val || {
        CustomerTypeId: "",
      };
      val.title = priTitle;
      _this.models.customers.splice(0, 1, val);
      // load premise address
      load_customerPremiseAddress(val.CustomerID, function(val) {
        _this.models.premiseAddress(val);
      }, join.add());
    }, join.add());

    // set secondary customer
    load_accountCustomer(_this.id, "SEC", function(val) {
      val = val || {
        CustomerTypeId: "",
      };
      val.title = secTitle;
      _this.models.customers.splice(1, 1, val);
      // updateUkovModel(_this.models.customers[1], val || {
      //   CustomerTypeId: "SEC",
      // });
    }, join.add());

    // join.when(function(err) {
    //   if (err) {
    //     return;
    //   }
    // });
  };

  // function updateUkovModel(ukovModel, data) {
  //   ukovModel.setValue(data);
  //   ukovModel.markClean(data);
  // }

  function load_accountCustomer(acctid, customerTypeId, setter, cb) {
    dataservice.monitoringstationsrv.accounts.read({
      id: acctid,
      link: "customers/" + customerTypeId,
    }, setter, cb);
  }

  function load_customerPremiseAddress(customerID, setter, cb) {
    dataservice.accountingengine.customers.read({
      id: customerID,
      link: "addresses/prem",
    }, setter, cb);
  }

  return ContractViewModel;
});
