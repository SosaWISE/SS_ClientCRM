define("src/scheduler/ticket.editor.vm", [
  "src/core/multiselect.vm",
  "src/scheduler/scheduler-cache",
  "src/scheduler/scheduleticket.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/combo.vm",
  "ko",
  "src/ukov",
  "src/dataservice",
  "src/core/strings",
  "src/core/joiner",
  "src/core/base.vm",
], function(
  MultiSelectViewModel,
  schedulercache,
  ScheduleTicketViewModel,
  notify,
  utils,
  ComboViewModel,
  ko,
  ukov,
  dataservice,
  strings,
  joiner,
  BaseViewModel
) {
  "use strict";

  ko.bindingHandlers.formatCustomerName = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

      // pass through to `text` binding
      ko.bindingHandlers.text.init(element, valueAccessor, allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      function newValueAccessor() {
        var data = ko.unwrap(valueAccessor());
        return strings.joinTrimmed(" ", data.Salutation, data.FirstName, data.MiddleName, data.LastName, data.Suffix);
      }

      // call `text` binding
      ko.bindingHandlers.text.update(element, newValueAccessor, allBindings, viewModel, bindingContext);
    },
  };

  var nullStrConverter = ukov.converters.nullString();
  var timeConverter = ukov.converters.time(
    function getStartDate(model) {
      return model._startDate;
    },
    function removeSeconds(dt) {
      dt.setSeconds(0, 0);
      return dt;
    }
  );
  var schema = {
    _model: true,
    ID: {},
    // CreatedOn: {},
    // CreatedBy: {},
    // ModifiedOn: {},
    // ModifiedBy: {},
    IsDeleted: {},
    Version: {},
    ServiceTypeId: {
      validators: [
        ukov.validators.isRequired("Please select a Service Type"),
      ],
    },
    AccountId: {
      converter: ukov.converters.number(0),
    },
    CurrentAppointmentId: {},
    MSTicketNum: {},
    Notes: {},
    CompletedNote: {},
    CompletedOn: {},

    // // AccountId: {
    // //   converter: ukov.converters.number(0),
    // // },
    // MonitoringStationNo: {},
    // MoniConfirmation: {},
    // TechConfirmation: {},
    // TechnicianId: {},
    // TripCharges: {},
    // Appointment: {},
    // AgentConfirmation: {},
    // ExpirationDate: {},
    // // Notes: {},

    AppointmentId: {},
    TechId: {
      validators: [
        ukov.validators.isRequired("TechId is required"),
      ],
    },
    StartOn: {
      converter: timeConverter,
      validators: [
        ukov.validators.isRequired("Start Time is required"),
      ],
    },
    EndOn: {
      converter: timeConverter,
      validators: [
        ukov.validators.isRequired("End Time is required"),
      ],
    },
    TravelTime: {},
    TechEnRouteOn: {},
  };
  var apptFields = ["TechId", "StartOn", "EndOn"];

  var schemaNote = {
    converter: nullStrConverter,
    // validators: [
    //   ukov.validators.isRequired("Please enter a note"),
    // ],
  };

  function TicketEditorViewModel(options) {
    var _this = this;
    TicketEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "item",
      "serviceTypes",
      "skills",
    ]);
    utils.setIfNull(_this, {
      title: "New Service Ticket",
      // showUserAccount: false,
      // showSave: true,
      // showSaveAndSchedule: true,
    });

    _this.mixinLoad();
    _this.initFocusFirst();

    _this.note = ukov.wrap("", schemaNote);
    _this.data = ukov.wrap(_this.item, schema);

    _this.data.serviceTypeCvm = new ComboViewModel({
      selectedValue: _this.data.ServiceTypeId,
      list: options.serviceTypes,
      fields: {
        value: "ID",
        text: "Name",
      },
    });
    _this.skillsMsvm = new MultiSelectViewModel({
      selectedValues: ukov.wrap([], {}),
      list: _this.skills, //@TODO: remove unwanted skills from skills???
    });

    // the general note should be in a Read Only format
    //  - 4 - Tech Confirmed
    //  - 5 - Completed
    //  - 7 - Waiting Change Form/SIF
    var statusCodeId = _this.item.StatusCodeId;
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

    // if (_this.showUserAccount &&
    //   _this.item.CustomerMasterFileId && _this.item.AccountId) {
    //   _this.cmdUserAccount = ko.command(function(cb) {
    //     _this.goTo({
    //       route: "accounts",
    //       masterid: _this.item.CustomerMasterFileId,
    //       id: _this.item.AccountId,
    //       tab: "servicetickets",
    //     });
    //     cb();
    //   }, function(busy) {
    //     return !busy;
    //   });
    // }

    _this.cmdSave = ko.command(function(cb) {
      saveTicketData(_this, utils.safeCallback(cb, function(err, resp) {
        if (err) {
          return;
        }
        if (resp && resp.Value) {
          _this.layerResult = resp.Value;
          closeLayer(_this);
        }
      }, utils.noop));
    }, function(busy) {
      return !busy && (!_this.cmdSchedule || !_this.cmdSchedule.busy());
    });

    _this.cmdSchedule = ko.command(function(cb) {
      _this.showAppt(!_this.showAppt.peek());
      cb();
      // saveTicketData(_this, utils.safeCallback(cb, function(err, resp) {
      //   if (err) {
      //     return;
      //   }
      //   if (resp) {
      //     _this.layerResult = resp.Value;
      //
      //   }
      // }, utils.noop));
    }, function(busy) {
      // tickets with these status codes can not be scheduled:
      //  - 4 - Tech Confirmed
      //  - 5 - Completed
      //  - 6 - Pending Contractor
      //  - 7 - Waiting Change Form/SIF
      return !busy && (!_this.cmdSave || !_this.cmdSave.busy()) &&
        (statusCodeId < 4 || 7 < statusCodeId);
    });


    _this.busy = ko.computed(function() {
      return _this.loading() || _this.cmdSave.busy();
    });


    _this.scheduleVm = new ScheduleTicketViewModel({
      ticketVm: _this,
      // appt: ticket.AppointmentId ? ticket : null,
    });

    _this.showAppt = ko.observable();
    _this.width = ko.observable();
    _this.height = ko.observable();

    _this.showAppt.subscribe(function(show) {
      var ignore = !show;
      apptFields.forEach(function(field) {
        _this.data[field].ignore(ignore);
      });
      _this.data.update(false, true);
      if (show) {
        _this.width("calc(100% - 20px)");
        _this.height("calc(100% - 20px)");
      } else {
        _this.width(390);
        _this.height(500);
      }
    });
    _this.showAppt(!!_this.item.AppointmentId);
  }
  utils.inherits(TicketEditorViewModel, BaseViewModel);
  TicketEditorViewModel.prototype.viewTmpl = "tmpl-scheduler-ticket-editor";
  TicketEditorViewModel.prototype.nowhite = true;

  TicketEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    schedulercache.ensure("skills", join.add());
    if (_this.item.ID) {
      loadTicketSkills(_this.item.ID, function(val) {
        _this.skillsMsvm.selectedValues(val);
        _this.skillsMsvm.selectedValues.markClean(val, true);
      }, join.add());
    } else {
      _this.skillsMsvm.selectedValues([]);
      _this.skillsMsvm.selectedValues.markClean([], true);
    }

    _this.scheduleVm.load(routeData, extraData, join.add());
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TicketEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, false];
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

  function saveTicketData(_this, cb) {
    var skillsData = _this.skillsMsvm.selectedValues;
    if (!_this.data.isValid() || !skillsData.isValid()) {
      var errMsg = _this.data.errMsg() || skillsData.errMsg();
      notify.warn(errMsg, null, 7);
      return cb(errMsg);
    }


    var join = joiner();

    saveTicket(_this, utils.safeCallback(join.add(), function() {
      saveTicketSkills(_this, _this.data.model.ID, join.add());
    }, utils.noop));

    join.when(function(err, resps) {
      cb(err, resps[0]);
    });
  }

  function saveTicket(_this, cb) {
    if (_this.showNotesInput) {
      var note = _this.note.getValue();
      if (note) {
        var currNotes = _this.data.Notes.peek();
        if (currNotes) {
          currNotes += "\n" + note;
        } else {
          currNotes = note;
        }
        _this.data.Notes(currNotes);
        _this.note("");
      }
    }

    var model = _this.data.getValue();
    if (_this.data.isClean() && model.ID) {
      // nothing to save
      return cb(null, {
        Code: 0,
        Value: _this.data.model,
      });
    }

    model.TravelTime = 0; //@TODO: implement TravelTime

    dataservice.ticketsrv.serviceTickets.save({
      id: model.ID, // if no value create, else update
      data: model,
    }, function(val) {
      _this.data.setValue(val);
      _this.data.markClean(val, true);
    }, cb);
  }

  function saveTicketSkills(_this, ticketID, cb) {
    var data = _this.skillsMsvm.selectedValues;
    if (data.isClean()) {
      // nothing to save
      return cb();
    }

    var model = data.getValue();
    dataservice.ticketsrv.serviceTickets.save({
      id: ticketID,
      data: model,
      link: "skills",
    }, function(val) {
      data.setValue(val);
      data.markClean(val, true);
    }, cb);
  }

  function loadTicketSkills(id, setter, cb) {
    dataservice.ticketsrv.serviceTickets.read({
      id: id,
      link: "skills",
    }, setter, cb);
  }

  // function setSkills(_this, skills) {
  //   // create lookup
  //   var skillsMap = {};
  //   skills.forEach(function(item) {
  //     skillsMap[item.SkillId] = item;
  //   });
  //   // set values
  //   _this.data.skills().forEach(function(item) {
  //     var skillId = item.model.SkillId;
  //     var skill = skillsMap[skillId];
  //     if (skill) {
  //       skill.checked = true;
  //     } else {
  //       skill = {
  //         checked: false,
  //         SkillId: skillId,
  //         Other: null,
  //       };
  //     }
  //     item.setValue(skill);
  //   });
  // }

  return TicketEditorViewModel;
});
