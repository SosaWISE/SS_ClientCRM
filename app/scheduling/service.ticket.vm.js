define('src/scheduling/service.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/router',
  'src/core/controller.vm',
  'src/scheduling/service.ticket.gvm',
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
  ServiceTicketGridViewModel,
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


  function ServiceTicketViewModel(options) {
    var _this = this;

    ServiceTicketViewModel.super_.call(_this, options);


    _this.layersVm = _this.layersVm || new LayersViewModel({
      controller: _this,
    });

    _this.data = ukov.wrap(_this.item || {
      TicketStatus: null,
    }, schema);

    //Ticket history grid
    _this.serviceTicketGvm = new ServiceTicketGridViewModel({
      edit: function(ticket, cb) {
        //alert(JSON.stringify(ticket));
        //console.log("before showTicketEditor call");
        //console.log("_this"+_this);
        //console.log("ticket"+utils.clone(ticket));
        //alert(JSON.stringify(utils.clone(ticket)));
        //console.log("cb"+cb);

        showTicketEditor(_this, utils.clone(ticket), cb);
      }
    });


    //This a layer for creating new ticket
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //Ticket status dropdown
    _this.data.ticketStatusCvm = new ComboViewModel({
      selectedValue: _this.data.TicketStatus,
      fields: {
        value: 'StatusCodeID',
        text: 'StatusCode',
      },
    });

    //events
    //

    _this.cmdNewTicket = ko.command(function(cb /*, vm*/ ) {

      _this.layersVm.show(new TicketEditorViewModel({
        pcontroller: _this,
        title: 'Create New Service Ticket'
      }), function onClose() {
        load_tickets({}, _this.serviceTicketGvm, cb);
      });


      cb();

    });

    _this.data.TicketStatus.subscribe(function(statusId, cb) {

      // 0 - All
      if (statusId || statusId === 0) {
        load_tickets({
          id: statusId,
          link: 'TSCID'
        }, _this.serviceTicketGvm, cb);
      }

    });

  }

  utils.inherits(ServiceTicketViewModel, ControllerViewModel);
  ServiceTicketViewModel.prototype.viewTmpl = 'tmpl-service-ticket';

  //
  // members
  //

  ServiceTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;

    //Initialize empty grid
    this.serviceTicketGvm.list([]);

    //load status list
    load_ticketStatusList(_this.data.ticketStatusCvm, join.add());

    //load all tickets created
    //load_tickets({}, _this.serviceTicketGvm, join.add());

  };

  ServiceTicketViewModel.prototype.onActivate = function(cb) { // override me
    var _this = this;

    //set default to All and load all tickets
    _this.data.TicketStatus(0);

    //load all tickets created
    //load_tickets({}, _this.serviceTicketGvm, cb);
    load_tickets({
      id: 0,
      link: 'TSCID'
    }, _this.serviceTicketGvm, cb);

  };

  function showTicketEditor(_this, ticket, cb) {
    var vm = new TicketEditorViewModel({
      pcontroller: _this,
      title: "Update Ticket",
      ticket: ticket
    });
    _this.layersVm.show(vm, cb);
  }

  function load_ticketStatusList(cvm, cb) {

    dataservice.scheduleenginesrv.TicketStatusCodeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        //clear dropdown first before inserting
        cvm.setList([]);

        console.log("TicketStatusCodeList:" + JSON.stringify(resp.Value));

        if (resp.Value.length > 0) {

          var data = [{
              StatusCodeID: 0,
              StatusCode: 'All'
            }],
            x;


          for (x = 0; x < resp.Value.length; x++) {
            data.push({
              StatusCodeID: resp.Value[x].StatusCodeID,
              StatusCode: resp.Value[x].StatusCode
            });
          }

          //Set result to Location combo list          
          cvm.setList(data);

        }

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }

  function load_tickets(param, cvm, cb) {

    dataservice.scheduleenginesrv.SeTicketList.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("Tickets:" + JSON.stringify(resp.Value));

        //empty the list before adding some data
        cvm.list([]);

        //Update inventoryListGvm grid
        for (var x = 0; x < resp.Value.length; x++) {
          cvm.list.push(resp.Value[x]);
        }

      } else {
        //notify.warn('No records found.', null, 3);
      }
    }));
  }

  return ServiceTicketViewModel;
});
