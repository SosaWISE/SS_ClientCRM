define('src/account/security/service.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/router',
  'src/core/controller.vm',
  'src/account/security/service.ticket.gvm',
  'src/account/security/ticket.editor.vm',
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
  'use strict';

  var schema;

  schema = {
    _model: true,
    AccountId: {},
    TicketStatus: {},
  };


  function ServiceTicketViewModel(options) {
    var _this = this;

    ServiceTicketViewModel.super_.call(_this, options);

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

    _this.cmdAddServiceTicket = ko.command(function(cb /*, vm*/ ) {
      //Go to TicketEditor  screen
      //alert('account id ' + _this.AccountId);

      _this.layersVm.show(new TicketEditorViewModel({
        pcontroller: _this,
        title: 'Create New Service Ticket',
        accountId: _this.AccountId
      }), function onClose() {
        load_tickets({
          id: _this.AccountId,
          link: 'ACCID'
        }, _this.serviceTicketGvm, cb);
      });


      cb();

    });

    _this.data.TicketStatus.subscribe(function(statusId, cb) {

      if (statusId) {
        load_tickets({
          id: statusId
        }, _this.serviceTicketGvm, cb);
      }

    });

  }

  utils.inherits(ServiceTicketViewModel, ControllerViewModel);
  ServiceTicketViewModel.prototype.viewTmpl = 'tmpl-security-service_ticket';

  //
  // members
  //

  ServiceTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;

    //console.log("routeData: "+routeData);
    // console.log("routeData.id: "+routeData.id);
    //    _this.accountId = routeData.id;
    _this.AccountId = routeData.id;

    //console.log("account id: "+_this.AccountID);

    //Initialize empty grid
    _this.serviceTicketGvm.list([]);

    //load status list
    load_ticketStatusList(_this.data.ticketStatusCvm, join.add());

    //load all tickets created
    //load_tickets({}, _this.serviceTicketGvm, join.add());
    load_tickets({
        id: _this.AccountId,
        link: 'ACCID'
      },
      _this.serviceTicketGvm, join.add()
    );

  };

  ServiceTicketViewModel.prototype.onActivate = function(cb) { // override me
    var _this = this;

    //load all tickets created
    load_tickets({
      id: _this.AccountId,
      link: 'ACCID'
    }, _this.serviceTicketGvm, cb);

  };

  function showTicketEditor(_this, ticket, cb) {
    var vm = new TicketEditorViewModel({
      pcontroller: _this,
      title: 'Update Ticket',
      ticket: ticket
    });
    _this.layersVm.show(vm, cb);
  }

  function load_ticketStatusList(cvm, cb) {

    dataservice.scheduleenginesrv.TicketStatusCodeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        //console.log("TicketStatusCodeList:" + JSON.stringify(resp.Value));

        if (resp.Value.length > 0) {
          //Set result to Location combo list
          cvm.setList(resp.Value);
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
        notify.warn('No records found.', null, 3);
      }
    }));
  }

  return ServiceTicketViewModel;
});
