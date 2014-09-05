define('src/scheduling/ticket.editor.vm', [
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
    TechConfirmation: {},
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

    // alert(JSON.stringify(_this.ticket));

    _this.ticket = _this.ticket || {
      TicketID: null,
      AccountId: null,
      TicketTypeId: null,
      MoniNumber: null,
      StatusCodeId: null,
      MoniConfirmation: null,
      TechConfirmation: null,
      TechnicianId: null,
      TripCharges: null,
      Appointment: null,
      AgentConfirmation: null,
      ExpirationDate: null,
      Notes: null,
    };


    _this.data = ukov.wrap(utils.clone(_this.ticket), schema);

    //console.log(JSON.stringify(_this.ticket));
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

      //account id validation
      dataservice.monitoringstationsrv.accounts.read({
        id: _this.data.AccountId(),
        link: 'Details',
      }, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0 && resp.Value) {

          console.log("Account Details:" + JSON.stringify(resp.Value));

          saveTicket(_this, cb);

        } else {
          notify.warn('Account ID is invalid.', null, 3);
        }

      }, notify.error, false));


      // if (!_this.data.isValid()) {
      //   notify.warn(_this.data.errMsg(), null, 7);
      //   cb();
      //   return;
      // }

      // var model = _this.data.getValue();
      // dataservice.scheduleenginesrv.SeTicket.save({
      //   id: model.TicketID, // if no value create, else update
      //   data: model,
      // }, null, utils.safeCallback(cb, function(err, resp) {
      //   _this.data.markClean(model, true);

      //   var data = resp.Value;        

      //   _this.layerResult = data;
      //   _this.isDeleted = false;
      //   closeLayer(_this);

      // }, notify.error, false));

    }, function(busy) {
      //return !busy && !_this.cmdSearch.busy() && !_this.cmdDelete.busy();
      return !busy;
    });

    _this.cmdSchedule = ko.command(function(cb) {
      //alert("go save the ticket and go directly to the schedule tab");
      // _this.goTo({
      //           route: 'scheduling',
      //           id:"schedule",
      //           ticketid:1
      //     });
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();

      dataservice.scheduleenginesrv.SeTicket.save({
        id: model.TicketID, // if no value create, else update
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {

        _this.data.markClean(model, true);

        var data = resp.Value;

        _this.goTo({
          route: 'scheduling',
          id: 'schedule',
          ticketid: data.TicketID,
          title: 'test'
        }, {
          ticket: data
        }, false);

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
  TicketEditorViewModel.prototype.viewTmpl = 'tmpl-ticket-editor';
  TicketEditorViewModel.prototype.width = 400;
  TicketEditorViewModel.prototype.height = 'auto';

  TicketEditorViewModel.prototype.onActivate = function( /*routeData*/ ) {
    //routeData.action="scheduling";
    //alert("on activate");
  };

  TicketEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;
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

  function saveTicket(_this, cb) {

    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
      return;
    }

    var model = _this.data.getValue();
    dataservice.scheduleenginesrv.SeTicket.save({
      id: model.TicketID, // if no value create, else update
      data: model,
    }, null, utils.safeCallback(cb, function(err, resp) {
      _this.data.markClean(model, true);

      var data = resp.Value;

      _this.layerResult = data;
      _this.isDeleted = false;
      closeLayer(_this);

    }, notify.error, false));

  }


  return TicketEditorViewModel;
});
