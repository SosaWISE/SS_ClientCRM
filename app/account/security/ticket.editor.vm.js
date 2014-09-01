define('src/account/security/ticket.editor.vm', [
  'src/core/notify',
  'src/core/utils',
  //'src/core/base.vm',
  'src/core/combo.vm',
  'ko',
  'src/ukov',
  'src/dataservice',
  'src/core/joiner',
  'src/core/controller.vm',

], function(
  notify,
  utils,
  // BaseViewModel,
  ComboViewModel,
  ko,
  ukov,
  dataservice,
  joiner,
  ControllerViewModel
) {
  'use strict';


  var schema;

  schema = {
    _model: true,
    TicketID: {},
    AccountId: {},
    TicketTypeId: {},
    MoniNumber: {},
    StatusCodeId: {},
    MoniConfirmation: {},
    TechnicianId: {},
    TripCharges: {},
    Appointment: {},
    AgentConfirmation: {},
    ExpirationDate: {},
    Notes: {},

  };


  function TicketEditorViewModel(options) {
    var _this = this;
    TicketEditorViewModel.super_.call(_this, options);
    _this.mixinLoad();
    //Set title
    _this.title = _this.title || 'Create New Service Ticket';


    //Set  field as first focusable
    _this.focusFirst = ko.observable(true);

    //  alert(_this.accountId);

    //  console.log("AccountId on ticket editor"+_this.AccountId);


    _this.ticket = _this.ticket || {
      TicketID: null,
      AccountId: _this.accountId,
      TicketTypeId: null,
      MoniNumber: null,
      StatusCodeId: null,
      MoniConfirmation: null,
      TechnicianId: null,
      TripCharges: null,
      Appointment: null,
      AgentConfirmation: null,
      ExpirationDate: null,
      Notes: null,
    };


    _this.data = ukov.wrap(utils.clone(_this.ticket), schema);

    _this.data.TicketTypeId(_this.ticket.TicketTypeId);

    //Ticket type dropdown
    _this.data.ticketTypeCvm = new ComboViewModel({
      selectedValue: _this.data.TicketTypeId,
      fields: {
        value: 'TicketTypeID',
        text: 'TicketTypeName',
      },
    });

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };

    // _this.cmdSave = ko.command(function(cb,vm) {
    //    saveTicket(vm, cb);
    //    cb();
    //  });

    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      //alert(JSON.stringify(model));

      dataservice.scheduleenginesrv.SeTicket.save({
        id: model.TicketID, // if no value create, else update
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.data.markClean(model, true);

        var data = resp.Value;
        //alert(JSON.stringify(data));

        _this.layerResult = data;
        _this.isDeleted = false;
        closeLayer(_this);
        //_this.clickCancel();
      }, notify.error, false));
    }, function(busy) {
      //return !busy && !_this.cmdSearch.busy() && !_this.cmdDelete.busy();
      return !busy;
    });

    _this.cmdSchedule = ko.command(function(cb) {

      var model = _this.data.getValue();

      _this.goTo({
        // pcontroller: _this,
        route: 'scheduling',
        //    tab: 'schedule',
        id: 1
      });



      dataservice.scheduleenginesrv.SeTicket.save({
        id: model.TicketID, // if no value create, else update
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {

        _this.data.markClean(model, true);

        var data = resp.Value;

        //console.log('schedule: ' + _this);  
        /*  
        _this.goTo({
          pcontroller: _this,
          route: 'scheduling',
          id: 'schedule',
          ticketid: data.TicketID,
          title: 'test'
        }, {
          ticket: data
        }, false);
        */



        _this.layerResult = data;
        _this.isDeleted = false;
        closeLayer(_this);

      }, notify.error, false));
    }, function(busy) {
      //return !busy && !_this.cmdSearch.busy() && !_this.cmdDelete.busy();
      return !busy;
    });

    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the barcode field
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

  }
  utils.inherits(TicketEditorViewModel, ControllerViewModel);
  // utils.inherits(TicketEditorViewModel, BaseViewModel);
  TicketEditorViewModel.prototype.viewTmpl = 'tmpl-security-service_ticket_editor';
  TicketEditorViewModel.prototype.width = 400;
  TicketEditorViewModel.prototype.height = 'auto';

  TicketEditorViewModel.prototype.onActivate = function( /*routeData*/ ) {
    // var _this =this;

    //routeData.action="scheduling";
    //alert("on activate"+JSON.stringify(routeData));
  };

  TicketEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    console.log('on ticket editor route id: ' + routeData.id);

    //alert(_this.AccountId);
    _this.AccountId = routeData.id;
    //load ticket type list
    load_ticketTypeList(_this.data.ticketTypeCvm, join.add());

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TicketEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_ticketTypeList(cvm, cb) {

    dataservice.scheduleenginesrv.TicketTypeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        //console.log("TicketTypeList:" + JSON.stringify(resp.Value));
        //Set result to TicketType combo list
        cvm.setList(resp.Value);
      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }


  return TicketEditorViewModel;
});
