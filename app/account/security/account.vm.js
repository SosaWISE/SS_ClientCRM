define("src/account/security/account.vm", [
  "src/account/security/checklist.vm",
  "src/account/security/summary.vm",
  "src/account/security/equipment.vm",
  "src/account/security/service.ticket.vm",
  "src/scheduler/account.service.tickets.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
  "ko"
], function(
  ChecklistViewModel,
  SummaryViewModel,
  EquipmentViewModel,
  ServiceTicketViewModel,
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
    ControllerViewModel.ensureProps(_this, ["id", "title"]);

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
    var _this = this,
      cb = join.add(),
      checklist;

    setTimeout(function() {
      checklist = extraData.checklist;
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

      _this.childs([
        checklist,
        _this.defaultChild = createSummary(_this, "Account Summary"),
        createFauxController(_this, "Signal History"),
        createEquipment(_this, "Equipment"),
        createFauxController(_this, "Contract Approval"),
        createServiceTicket(_this, "Schedule Service"),
        createAccountServiceTickets(_this, "Service Tickets"),
      ]);
      cb();
    }, 0);
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

  function createServiceTicket(pcontroller, title) {
    return new ServiceTicketViewModel({
      pcontroller: pcontroller,
      id: titleToId(title),
      title: title
    });
  }

  function createAccountServiceTickets(pcontroller, title) {
    return new AccountServiceTicketsViewModel({
      pcontroller: pcontroller,
      id: titleToId(title),
      title: title
    });
  }


  function titleToId(title) {
    return title.toLowerCase().replace(/\s+/g, "").replace(/\//g, "-");
  }

  return AccountViewModel;
});
