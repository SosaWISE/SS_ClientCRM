define("src/scheduler/ticket.editor.vm", [
  "src/scheduler/scheduler-helper",
  "src/scheduler/ticket.close.vm",
  "src/scheduler/ticket.model",
  "src/scheduler/scheduler-cache",
  "src/scheduler/scheduleticket.vm",
  "src/core/multiselect.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/combo.vm",
  "ko",
  "src/ukov",
  "dataservice",
  "src/core/strings",
  "src/core/joiner",
  "src/core/base.vm",
], function(
  schedulerhelper,
  TicketCloseViewModel,
  ticket_model,
  schedulercache,
  ScheduleTicketViewModel,
  MultiSelectViewModel,
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

  var apptFields = ["TechId", "StartOn", "EndOn"];

  function TicketEditorViewModel(options) {
    var _this = this;
    TicketEditorViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "item",
      "serviceTypes",
      "skills",
    ]);
    _this.mixinLoad();
    _this.initFocusFirst();

    _this.data = ticket_model(_this.item, {
      serviceTypes: options.serviceTypes,
    });
    _this.skillsMsvm = new MultiSelectViewModel({
      selectedValues: ukov.wrap([], {}),
      list: _this.skills, //@TODO: remove unwanted skills from skills???
    });


    // the general note should be in a Read Only format
    //  - 4 - Tech Confirmed
    //  - 5 - Completed
    //  - 7 - Waiting Change Form/SIF
    _this.showNotesInput = ko.computed(function() {
      var statusCodeId = _this.data.StatusCodeId();
      return statusCodeId !== 4 &&
        statusCodeId !== 5 &&
        statusCodeId !== 7;
    });

    _this.scheduleVm = new ScheduleTicketViewModel({
      ticketVm: _this,
      // appt: ticket.AppointmentId ? ticket : null,
    });
    _this.scheduleVm.monthVm.selectedDate.subscribe(function(dt) {
      // set date
      _this.data.model._startDate = dt;

      var startProp = _this.data.StartOn;
      var endProp = _this.data.EndOn;
      // cache EndOn since it may change when StartOn is set
      var endOn = endProp.getValue();
      // update times
      touchPropTime(startProp, startProp.getValue());
      touchPropTime(endProp, endOn);
    });


    //
    // events
    //
    _this.clickCancel = function() {
      // _this.layerResult = null;
      closeLayer(_this);
    };

    if (_this.onOpenAccount && utils.isFunc(_this.onOpenAccount)) {
      _this.cmdOpenAccount = ko.command(function(cb) {
        _this.onOpenAccount(_this.data.CustomerMasterFileId.peek(), _this.data.AccountId.peek());
        cb();
      }, function(busy) {
        return !busy && _this.data.CustomerMasterFileId() && _this.data.AccountId();
      });
    }

    _this.cmdSave = ko.command(function(cb) {
      saveTicketData(_this, cb);
    }, function(busy) {
      return !busy && !_this.busy() && canSchedule(_this);
    });
    _this.cmdScheduleAppt = ko.command(function(cb) {
      // show appointment scheduler
      _this.showAppt(true);
      cb();
    }, function(busy) {
      return !busy && !_this.busy() && canSchedule(_this);
      // _this.scheduleVm.loaded() && !_this.scheduleVm.board.busy() &&
    });
    _this.cmdCancelAppt = ko.command(function(cb) {
      var model = _this.data.getValue();
      dataservice.ticketsrv.serviceTickets.del({
        id: model.ID,
        link: "Appointment",
        query: {
          v: model.Version,
        },
      }, function(val) {
        handleTicketResult(_this, val);
        // ensure today is selected
        _this.scheduleVm.monthVm.selectedDate(new Date());
      }, cb);
    }, function(busy) {
      return !busy && !_this.busy() && canSchedule(_this);
    });
    _this.cmdCloseTicket = ko.command(function(cb) {
      _this.layersVm.show(new TicketCloseViewModel({
        ticketid: _this.data.ID.peek(),
        version: _this.data.Version.peek(),
      }), function(val) {
        if (val) {
          handleTicketResult(_this, val);
        }
        cb();
      });
    }, function(busy) {
      return !busy && !_this.busy() && canSchedule(_this);
    });

    _this.busy = ko.computed(function() {
      return (_this.loading() ||
        _this.cmdSave.busy() ||
        _this.cmdCancelAppt.busy()
      );
    });

    _this.width = ko.observable();
    _this.height = ko.observable();
    _this.showAppt = ko.observable(true);
    _this.showAppt.subscribe(function(show) {
      var ignore = !show;
      apptFields.forEach(function(field) {
        _this.data[field].ignore(ignore);
      });
      _this.data.update(false, true);

      var w, h;
      if (show) {
        // ensure schedule is loaded
        _this.scheduleVm.load({}, {}, utils.noop);
        w = "calc(100% - 20px)";
        h = "100%";
      } else {
        w = "390px";
        h = "auto";
      }
      _this.width(w);
      _this.height(h);
    });
    _this.showAppt(false);
  }
  utils.inherits(TicketEditorViewModel, BaseViewModel);
  TicketEditorViewModel.prototype.viewTmpl = "tmpl-scheduler-ticket_editor";
  TicketEditorViewModel.prototype.nowhite = true;
  TicketEditorViewModel.prototype.cmdOpenAccount = null;

  TicketEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    schedulercache.ensure("skills", join.add());
    if (_this.data.ID.peek()) {
      loadTicketSkills(_this.data.ID.peek(), function(val) {
        _this.skillsMsvm.selectedValues(val);
        _this.skillsMsvm.selectedValues.markClean(val, true);
      }, join.add());
    } else {
      _this.skillsMsvm.selectedValues([]);
      _this.skillsMsvm.selectedValues.markClean([], true);
    }
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
    if (!_this.layerResult) {
      if (_this.cmdSave.busy()) {
        msg = "Please wait for save to finish.";
      } else if (_this.cmdCancelAppt.busy()) {
        msg = "Please wait for appointment cancellation to finish.";
        // } else if (_this.cmdCloseTicket.busy()) {
        //   msg = "Please wait for ticket to be closed.";
      }
    }
    return msg;
  };

  function handleTicketResult(_this, val) {
    schedulerhelper.afterTicketLoaded(val);
    _this.layerResult = val;
    _this.data.setValue(val);
    _this.data.markClean(val, true);
  }

  function touchPropTime(timeProp, time) {
    if (!(time instanceof Error)) {
      timeProp.setValue(strings.format("{0:t}", time));
    }
  }

  function canSchedule(_this) {
    var statusCodeId = _this.data.StatusCodeId();
    // tickets with these status codes can not be scheduled:
    //  - 4 - Tech Confirmed
    //  - 5 - Completed
    //  - 6 - Pending Contractor
    //  - 7 - Waiting Change Form/SIF
    return (statusCodeId < 4 || 7 < statusCodeId);
  }

  function saveTicketData(_this, cb) {
    var errMsg;
    var skillsData = _this.skillsMsvm.selectedValues;
    if (!_this.data.isValid() || !skillsData.isValid()) {
      errMsg = _this.data.errMsg() || skillsData.errMsg();
      notify.warn(errMsg, null, 7);
      return cb(errMsg);
    }

    var overlapItem = _this.scheduleVm.firstOverlapItem(_this);
    if (overlapItem) {
      var id = overlapItem.data.ID.peek();
      if (id > 0) {
        errMsg = strings.format("This appointment overlaps the appointment for Ticket #{0}", id);
      } else {
        errMsg = "An appointment can only be scheduled when the tech is scheduled to work.";
      }
      notify.warn(errMsg, null, 7);
      return cb(errMsg);
    }

    var join = joiner();

    saveTicket(_this, utils.safeCallback(join.add(), function() {
      saveTicketSkills(_this, _this.data.ID.peek(), join.add());
    }, utils.noop));

    join.when(function(err, resps) {
      resps = resps;
      if (!err) {
        closeLayer(_this);
      }
      cb(err);
    });
  }

  function saveTicket(_this, cb) {
    var model = _this.data.getValue();
    if (_this.data.isClean() && model.ID) {
      // nothing to save
      return cb(null, {
        Code: 0,
        Value: _this.data.model,
      });
    }

    model.TravelTime = 0; //@TODO: implement TravelTime

    delete model.Notes; // do not send Notes since AppendNotes is the value that will be used
    schedulerhelper.beforeTicketSaved(model);
    dataservice.ticketsrv.serviceTickets.save({
      id: model.ID || "", // if no value create, else update
      data: model,
    }, function(val) {
      handleTicketResult(_this, val);
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

  return TicketEditorViewModel;
});
