define("src/scheduler/service.tickets.vm", [
  "src/scheduler/scheduler-helper",
  "src/scheduler/scheduler-cache",
  "src/scheduler/service.tickets.gvm",
  "src/scheduler/ticket.editor.vm",
  "src/dataservice",
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  schedulerhelper,
  schedulercache,
  ServiceTicketsGridViewModel,
  TicketEditorViewModel,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function ServiceTicketsViewModel(options) {
    var _this = this;
    ServiceTicketsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
    ]);

    if (_this.openAccount) {
      _this.openAccount = _this.openAccount.bind(_this);
    }

    _this.gvm = new ServiceTicketsGridViewModel({
      edit: function(ticket, cb) {
        _this.layersVm.show(new TicketEditorViewModel({
          onOpenAccount: _this.openAccount, //
          item: utils.clone(ticket),
          serviceTypes: schedulercache.getList("serviceTypes").peek(),
          skills: schedulercache.getList("skills").peek(),
        }), function(model, deleted) {
          cb(model, deleted);
        });
      },
    });

    //
    // events
    //
    _this.cmdRefreshGrid = ko.command(function(cb) {
      _this.gvm.setItems([]);
      _this.loadServiceTickets(function(items) {
        items.forEach(schedulerhelper.afterTicketLoaded);
        _this.gvm.setItems(items);
      }, cb);
    });
  }
  utils.inherits(ServiceTicketsViewModel, ControllerViewModel);
  ServiceTicketsViewModel.prototype.viewTmpl = "tmpl-scheduler-service_tickets";

  ServiceTicketsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    var typesJoin = join.create();
    schedulercache.ensure("serviceTypes", typesJoin.add());
    schedulercache.ensure("skills", typesJoin.add());
    schedulercache.ensure("statusCodes", typesJoin.add());

    var cb = join.add();
    typesJoin.when(function(err) {
      if (err) {
        cb(err);
      } else {
        _this.cmdRefreshGrid.execute(cb);
      }
    });
  };

  ServiceTicketsViewModel.prototype.openAccount = function(masterid, accountid) { // override me
    var _this = this;
    _this.goTo({
      route: "accounts",
      masterid: masterid,
      id: accountid,
      tab: "servicetickets", // ???
    });
  };

  ServiceTicketsViewModel.prototype.loadServiceTickets = function(setter, cb) { // override me
    load_serviceTickets(setter, cb);
  };

  function load_serviceTickets(setter, cb) {
    dataservice.ticketsrv.serviceTickets.read({}, setter, cb);
  }

  return ServiceTicketsViewModel;
});
