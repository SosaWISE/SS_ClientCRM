define('src/account/security/service.ticket.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/router',
  'src/core/controller.vm',
  'src/account/security/service.ticket.gvm',
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
        accountId: _this.AccountId,
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

    // //load tickets created
    // load_tickets(_this.AccountId, _this.serviceTicketGvm, join.add());
  };

  ServiceTicketViewModel.prototype.onActivate = function() { // override me
    var _this = this;

    //load all tickets created
    load_tickets(_this.AccountId, _this.serviceTicketGvm, notify.iferror);
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
    cvm.setList([]);
    dataservice.scheduleenginesrv.TicketStatusCodeList.read({}, cvm.setList, cb);
  }

  function load_tickets(id, gvm, cb) {
    gvm.list([]);
    dataservice.scheduleenginesrv.SeTicketList.read({
      id: id,
      link: 'ACCID',
    }, gvm.list, cb);
  }

  return ServiceTicketViewModel;
});
