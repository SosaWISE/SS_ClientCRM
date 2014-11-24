define('src/scheduling/reschedule.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/router',
  'src/core/controller.vm',
  'src/scheduling/reschedule.ticket.gvm',
  'src/scheduling/ticket.editor.vm',
  'src/core/layers.vm',
  'src/core/joiner',
  'src/slick/slickgrid.vm',
  'src/slick/rowevent',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  Router,
  ControllerViewModel,
  ReScheduleTicketGridViewModel,
  TicketEditorViewModel,
  LayersViewModel,
  joiner,
  SlickGridViewModel,
  RowEvent,
  ko,
  ukov
) {
  "use strict";

  var schema;
  schema = {
    _model: true,
    TicketStatus: {},
  };

  function ReScheduleTicketViewModel(options) {
    var _this = this;
    ReScheduleTicketViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.data = ukov.wrap(_this.item || {
      TicketStatus: null,
    }, schema);

    //Ticket history grid
    _this.gvm = new ReScheduleTicketGridViewModel({
      edit: function(ticket, cb) {
        showTicketEditor(_this, ticket, cb);
      }
    });

    //
    //events
    //
  }

  utils.inherits(ReScheduleTicketViewModel, ControllerViewModel);
  ReScheduleTicketViewModel.prototype.viewTmpl = 'tmpl-reschedule-ticket';

  //
  // members
  //

  ReScheduleTicketViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // override me
    var _this = this;
    // refresh the tickets everytime this tab is activated...???
    refreshTickets(_this);
  };

  function refreshTickets(_this) {
    //load all tickets created - no filtering yet that includes un-completed ticket that have passed 4 hours
    load_tickets(4, _this.gvm);
  }

  function showTicketEditor(_this, ticket, cb) {
    var vm = new TicketEditorViewModel({
      pcontroller: _this,
      title: "Reschedule Ticket",
      ticket: utils.clone(ticket),
      showUserAccount: true,
      showSave: false,
    });
    _this.layersVm.show(vm, cb);
  }

  function load_tickets(hours, cvm, cb) {
    cvm.list([]);
    dataservice.scheduleenginesrv.SeTicketReScheduleList.read({
      id: hours,
    }, cvm.list, cb);
  }

  return ReScheduleTicketViewModel;
});
