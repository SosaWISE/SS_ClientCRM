define('src/scheduling/technician.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/scheduling/technician.ticket.gvm',
  'src/app',
  //'src/core/layers.vm',
  //'src/core/joiner',
  //'ko',
  //'src/ukov',

], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel,
  TechnicianTicketGridViewModel,
  app
  //LayersViewModel
  //joiner,
  //ko,
  //ukov
) {
  'use strict';

  var schema;

  schema = {
    _model: true
  };


  function TechTicketsViewModel(options) {
    var _this = this;
    TechTicketsViewModel.super_.call(_this, options);

    _this.technicianTicketGvm = new TechnicianTicketGridViewModel({

    });

    //
    // events
    //

  }

  utils.inherits(TechTicketsViewModel, ControllerViewModel);
  TechTicketsViewModel.prototype.viewTmpl = 'tmpl-technician-tickets';

  TechTicketsViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this,
      param = {};
    join = join;

    //Initialize empty grid
    this.technicianTicketGvm.list([]);

    param = {
      id: app.user.peek().GPEmployeeID,
      link: 'TID'
    };

    //load all tickets for this technician id
    load_tickets(param, _this.technicianTicketGvm, join.add());

  };

  //TechTicketsViewModel.prototype.onActivate = function( /*routeData*/ ) {};

  function load_tickets(param, cvm, cb) {

    dataservice.scheduleenginesrv.SeTicketList.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("Technician Tickets:" + JSON.stringify(resp.Value));

        //empty the list before adding some data
        cvm.list([]);

        //Update inventoryListGvm grid
        for (var x = 0; x < resp.Value.length; x++) {
          cvm.list.push(resp.Value[x]);
        }

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));
  }

  return TechTicketsViewModel;
});
