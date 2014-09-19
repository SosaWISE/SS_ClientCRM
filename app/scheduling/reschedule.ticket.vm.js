define('src/scheduling/reschedule.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/router',
  'src/core/controller.vm',
  'src/scheduling/reschedule.ticket.gvm',
  'src/scheduling/reschedule.ticket.editor.vm',
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
  ReScheduleTicketEditorViewModel,
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


    _this.layersVm = _this.layersVm || new LayersViewModel({
      controller: _this,
    });

    _this.data = ukov.wrap(_this.item || {
      TicketStatus: null,
    }, schema);

    //Ticket history grid
    _this.reScheduleTicketGvm = new ReScheduleTicketGridViewModel({
      edit: function(ticket, cb) {
        showTicketEditor(_this, utils.clone(ticket), cb);
      }
    });


    //This a layer for creating new ticket
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });


    //events
    //

  }

  utils.inherits(ReScheduleTicketViewModel, ControllerViewModel);
  ReScheduleTicketViewModel.prototype.viewTmpl = 'tmpl-reschedule-ticket';

  //
  // members
  //

  ReScheduleTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    //var _this = this;
    join = join;

    //Initialize empty grid
    this.reScheduleTicketGvm.list([]);


  };

  ReScheduleTicketViewModel.prototype.onActivate = function(cb) { // override me
    var _this = this;

    //load all tickets created - no filtering yet that includes un-completed ticket that have passed 4 hours
    load_tickets({
      id: 4,
    }, _this.reScheduleTicketGvm, cb);

  };

  function showTicketEditor(_this, ticket, cb) {
    var vm = new ReScheduleTicketEditorViewModel({
      pcontroller: _this,
      title: "Reschedule Ticket",
      ticket: ticket
    });
    _this.layersVm.show(vm, cb);
  }

  function load_tickets(param, cvm, cb) {

    dataservice.scheduleenginesrv.SeTicketReScheduleList.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("Re-schedule Tickets:" + JSON.stringify(resp.Value));

        //empty the list before adding some data
        cvm.list([]);

        //Update inventoryListGvm grid
        for (var x = 0; x < resp.Value.length; x++) {
          cvm.list.push(resp.Value[x]);
        }

      }
    }));
  }

  return ReScheduleTicketViewModel;
});
