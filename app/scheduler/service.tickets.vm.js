define("src/scheduler/service.tickets.vm", [
  "slick",
  "src/scheduler/scheduler-helper",
  "src/scheduler/scheduler-cache",
  "src/scheduler/service.tickets.gvm",
  "src/scheduler/ticket.editor.vm",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  Slick,
  schedulerhelper,
  schedulercache,
  ServiceTicketsGridViewModel,
  TicketEditorViewModel,
  dataservice,
  ukov,
  ko,
  strings,
  notify,
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

    _this.gvm = new ServiceTicketsGridViewModel({
      edit: function(ticket, cb) {
        _this.layersVm.show(new TicketEditorViewModel({
          item: utils.clone(ticket),
          serviceTypes: schedulercache.getList("serviceTypes").peek(),
          skills: schedulercache.getList("skills").peek(),
        }), function(model, deleted) {
          if (model) {
            schedulerhelper.ensureTypeNames(model);
          }
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
        items.forEach(function(item) {
          schedulerhelper.ensureTypeNames(item);
        });
        //
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

  ServiceTicketsViewModel.prototype.loadServiceTickets = function(setter, cb) { // override me
    load_serviceTickets(setter, cb);
  };

  function load_serviceTickets(setter, cb) {
    dataservice.ticketsrv.serviceTickets.read({}, setter, cb);
  }

  return ServiceTicketsViewModel;
});
