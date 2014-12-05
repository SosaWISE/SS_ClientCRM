define("src/scheduling/ticket.editor.vm", [
  "src/core/notify",
  "src/core/utils",
  "src/core/combo.vm",
  "ko",
  "src/ukov",
  "src/dataservice",
  "src/core/joiner",
  "src/core/controller.vm",
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
  "use strict";

  var nullStrConverter = ukov.converters.nullString();
  var schema = {
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
  var schemaNote = {
    converter: nullStrConverter,
    // validators: [
    //   ukov.validators.isRequired("Please enter a note"),
    // ],
  };

  function TicketEditorViewModel(options) {
    var _this = this;
    TicketEditorViewModel.super_.call(_this, options);
    // ControllerViewModel.ensureProps(_this, [
    //   "layersVm",
    // ]);
    utils.setIfNull(_this, {
      title: "Create New Service Ticket",
      showUserAccount: false,
      showSave: true,
      showSaveAndSchedule: true,
    });

    _this.initFocusFirst();

    _this.ticket = _this.ticket || {
      AccountId: _this.accountId,
    };

    _this.note = ukov.wrap("", schemaNote);
    _this.data = ukov.wrap(_this.ticket, schema);
    _this.data.TicketTypeId(_this.ticket.TicketTypeId);

    _this.data.ticketTypeCvm = new ComboViewModel({
      selectedValue: _this.data.TicketTypeId,
      fields: {
        value: "TicketTypeID",
        text: "TicketTypeName",
      },
    });

    // the general note should be in a Read Only format
    //  - 4 - Tech Confirmed
    //  - 5 - Completed
    //  - 7 - Waiting Change Form/SIF
    var statusCodeId = _this.data.StatusCodeId.peek();
    _this.showNotesInput = (
      statusCodeId !== 4 &&
      statusCodeId !== 5 &&
      statusCodeId !== 7
    );

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    if (_this.showUserAccount) {
      _this.cmdUserAccount = ko.command(function(cb) {
        _this.goTo({
          route: "accounts",
          masterid: _this.ticket.CustomerMasterFileId,
          id: _this.ticket.AccountId,
          tab: "scheduleservice",
        });
        cb();
      }, function(busy) {
        return !busy;
      });
    }
    if (_this.showSave) {
      _this.cmdSave = ko.command(function(cb) {
        saveTicket(_this, cb);
      }, function(busy) {
        return !busy && (!_this.cmdSchedule || !_this.cmdSchedule.busy());
      });
    }
    if (_this.showSaveAndSchedule) {
      _this.cmdSchedule = ko.command(function(cb) {
        saveTicket(_this, utils.safeCallback(cb, function(err, resp) {
          if (err) {
            return;
          }
          var data = resp.Value;
          _this.goTo({
            pcontroller: _this,
            route: "scheduling",
            id: "schedule",
            ticketid: data.TicketID,
          }, {
            ticket: data
          }, false);
        }, utils.noop));
      }, function(busy) {
        // tickets with these status codes can not be scheduled:
        //  - 4 - Tech Confirmed
        //  - 5 - Completed
        //  - 6 - Pending Contractor
        //  - 7 - Waiting Change Form/SIF
        // var statusCodeId = _this.data.StatusCodeId(); // StatusCodeId should not change???
        return !busy && (!_this.cmdSave || !_this.cmdSave.busy()) &&
          (statusCodeId < 4 || 7 < statusCodeId);
      });
    }
  }
  utils.inherits(TicketEditorViewModel, ControllerViewModel);
  TicketEditorViewModel.prototype.viewTmpl = "tmpl-ticket-editor";
  TicketEditorViewModel.prototype.width = 450;
  TicketEditorViewModel.prototype.height = "auto";

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
  TicketEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (!_this.layerResult &&
      (
        (_this.cmdSave && _this.cmdSave.busy()) ||
        (_this.cmdSchedule && _this.cmdSchedule.busy())
      )) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };

  function load_ticketTypeList(cvm, cb) {
    cvm.setList([]);
    dataservice.scheduleenginesrv.TicketTypeList.read({}, cvm.setList, utils.safeCallback(cb, function(err, resp) {
      if (resp.Message && resp.Message !== "Success") {
        notify.error(resp, 5);
      }
    }, utils.noop));
  }

  function saveTicket(_this, cb) {
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb(_this.data.errMsg());
      return;
    }

    var model = _this.data.getValue();
    if (_this.showNotesInput) {
      var note = _this.note.getValue();
      if (note) {
        if (model.Notes) {
          model.Notes += '\n' + note;
        } else {
          model.Notes = note;
        }
      }
    }
    dataservice.scheduleenginesrv.SeTicket.save({
      id: model.TicketID, // if no value create, else update
      data: model,
    }, null, utils.safeCallback(cb, function(err, resp) {
      _this.data.markClean(model, true);
      var data = resp.Value;

      _this.layerResult = data;
      closeLayer(_this);
    }, notify.iferror));
  }

  return TicketEditorViewModel;
});
