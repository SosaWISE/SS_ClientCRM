define("src/account/security/account.vm", [
  "howie",
  "src/contracts/contract.vm",
  "src/account/security/checklist.vm",
  "src/account/security/summary.vm",
  "src/account/security/equipment.vm",
  "src/scheduler/account.service.tickets.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
  "ko"
], function(
  howie,
  ContractViewModel,
  ChecklistViewModel,
  SummaryViewModel,
  EquipmentViewModel,
  AccountServiceTicketsViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  function AccountViewModel(options) {
    var _this = this;
    AccountViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "id",
      "title",
    ]);

    _this.title = ko.observable(_this.title);
    _this.rmr = ko.observable(_this.rmr);
    _this.hasRmr = ko.observable(_this.rmr() != null);
    _this.units = ko.observable(_this.units);

    _this.depth = _this.depth || 0;
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(AccountViewModel, ControllerViewModel);
  AccountViewModel.prototype.viewTmpl = "tmpl-security-account";

  AccountViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    var checklist = extraData.checklist;
    if (checklist && checklist instanceof ChecklistViewModel) {
      checklist = extraData.checklist;
      checklist.updateRouting(_this);
    } else {
      checklist = new ChecklistViewModel({
        pcontroller: _this,
      });
    }
    checklist.id = "checklist";
    checklist.title = "Setup Checklist";

    var list = [
      checklist,
      _this.defaultChild = createSummary(_this, "Account Summary"),
      createFauxController(_this, "Signal History"),
      createEquipment(_this, "Equipment"),
      createAccountServiceTickets(_this, "Service Tickets"),
    ];
    if (inTextList(howie.fetch("user").Apps, "contract_admin")) {
      list.push(createContractVm(_this, "Contract Admin"));
    }
    _this.childs(list);
    join.add()();
  };

  function createEquipment(pcontroller, title) {
    return new EquipmentViewModel({
      pcontroller: pcontroller,
      id: titleToId(title),
      title: title,
    });
  }

  function createSummary(pcontroller, title) {
    return new SummaryViewModel({
      pcontroller: pcontroller,
      id: titleToId(title),
      title: title,
    });
  }

  function createFauxController(pcontroller, title) {
    return new ControllerViewModel({
      pcontroller: pcontroller,
      id: titleToId(title),
      title: title,
      viewTmpl: "tmpl-temptitle",
    });
  }

  function createAccountServiceTickets(pcontroller, title) {
    return new AccountServiceTicketsViewModel({
      pcontroller: pcontroller,
      id: titleToId(title),
      title: title
    });
  }

  function createContractVm(_this, title) {
    return new ContractViewModel({
      pcontroller: _this,
      id: titleToId(title),
      title: title,
    });
  }

  function inTextList(list, text) {
    if (!list) {
      return false;
    }
    // text = text.toUpperCase();
    text = text.toLowerCase();
    return list.some(function(str) {
      // return str.toUpperCase() === text;
      return str.toLowerCase() === text;
    });
  }


  function titleToId(title) {
    return title.toLowerCase().replace(/\s+/g, "").replace(/\//g, "-");
  }

  return AccountViewModel;
});
