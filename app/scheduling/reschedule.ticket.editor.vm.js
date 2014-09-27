define('src/scheduling/reschedule.ticket.editor.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/combo.vm',
  'ko',
  'src/ukov',
  'src/dataservice',
  'src/core/joiner',
  'src/core/controller.vm',

], function(
  notify,
  utils,
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
    AccountId: {
      converter: ukov.converters.number(0),
    },
    TicketTypeId: {},
    MonitoringStationNo: {},
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


  function ReScheduleTicketEditorViewModel(options) {
    var _this = this;
    ReScheduleTicketEditorViewModel.super_.call(_this, options);
    _this.mixinLoad();

    //Set title
    _this.title = _this.title || 'Reschedule Ticket';

    //Set  field as first focusable
    _this.focusFirst = ko.observable(true);

    _this.ticket = _this.ticket || {
      TicketID: null,
      AccountId: null,
      TicketTypeId: null,
      MonitoringStationNo: null,
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

    _this.cmdUserAccount = ko.command(function() {
      _this.goTo({
        route: 'accounts',
        masterid: _this.ticket.CustomerMasterFileId,
      });
    }, function(busy) {
      return !busy;
    });

    _this.cmdSaveAndSchedule = ko.command(function(cb) {

      //checking account id
      dataservice.monitoringstationsrv.accounts.read({
        id: _this.data.AccountId(),
        link: 'Validate',
      }, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0 && resp.Value) {

          console.log("Account Validate:" + JSON.stringify(resp.Value));

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
              pcontroller: _this,
              route: 'scheduling',
              id: 'schedule',
              ticketid: data.TicketID,

            }, {
              ticket: data
            }, false);


            _this.layerResult = data;
            _this.isDeleted = false;
            closeLayer(_this);

          }, notify.error, false));


        } else {
          notify.warn('Account ID is invalid.', null, 3);
        }

      }, notify.error, false));


    }, function(busy) {
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
  utils.inherits(ReScheduleTicketEditorViewModel, ControllerViewModel);
  ReScheduleTicketEditorViewModel.prototype.viewTmpl = 'tmpl-reschedule-ticket-editor';
  ReScheduleTicketEditorViewModel.prototype.width = 400;
  ReScheduleTicketEditorViewModel.prototype.height = 'auto';

  ReScheduleTicketEditorViewModel.prototype.onActivate = function( /*routeData*/ ) {};

  ReScheduleTicketEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;
    //load ticket type list
    load_ticketTypeList(_this.data.ticketTypeCvm, join.add());

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  ReScheduleTicketEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_ticketTypeList(cvm, cb) {

    dataservice.scheduleenginesrv.TicketTypeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        //Set result to TicketType combo list
        cvm.setList(resp.Value);
      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }


  return ReScheduleTicketEditorViewModel;
});
