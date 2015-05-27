define("src/scheduler/tech.tickets.vm", [
  "src/scheduler/scheduler-helper",
  "src/scheduler/scheduler-cache",
  "src/scheduler/tech.tickets.gvm",
  "src/scheduler/ticket.editor.vm",
  "dataservice",
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  schedulerhelper,
  schedulercache,
  TechTicketsGridViewModel,
  TicketEditorViewModel,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function TechTicketsViewModel(options) {
    var _this = this;
    TechTicketsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "techSetupVm",
      "layersVm",
    ]);

    _this.gvm = new TechTicketsGridViewModel({
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
      load_serviceTickets(_this.techSetupVm.data.ID.peek(), function(items) {
        items.forEach(schedulerhelper.afterTicketLoaded);
        _this.gvm.setItems(items);
      }, cb);
    });
  }
  utils.inherits(TechTicketsViewModel, ControllerViewModel);
  TechTicketsViewModel.prototype.viewTmpl = "tmpl-scheduler-tech_tickets";

  TechTicketsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    // _this.recruitid = routeData.id;

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

  function load_serviceTickets(techid, setter, cb) {
    dataservice.ticketsrv.serviceTickets.read({
      query: {
        TechId: techid || 0,
      }
    }, setter, cb);
  }

  return TechTicketsViewModel;
});
