define("src/scheduler/appt.editor.vm", [
  "src/dataservice",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  dataservice,
  ko,
  ukov,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function getStartDate(model) {
    return model._startDate;
  }

  function removeSeconds(dt) {
    dt.setSeconds(0, 0);
    return dt;
  }
  var schema = {
    _model: true,

    // ID: {},
    AppointmentId: {},
    Version: {},
    ServiceTicketId: {},
    TechId: {},
    StartOn: {
      converter: ukov.converters.time(getStartDate, removeSeconds),
      validators: [
        ukov.validators.isRequired("Start Time is required"),
      ],
    },
    EndOn: {
      converter: ukov.converters.time(getStartDate, removeSeconds),
      validators: [
        ukov.validators.isRequired("End Time is required"),
      ],
    },
    TravelTime: {},
    TechEnRouteOn: {},
  };

  function ApptEditorViewModel(options) {
    var _this = this;
    ApptEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "item",
      "board",
    ]);
    BaseViewModel.ensureProps(_this.item, [
      "StartOn",
      "EndOn",
    ]);

    var startDate = new Date(_this.item.StartOn.valueOf());
    _this.item._startDate = startDate;
    _this.startDateText = strings.format("{0:d}", startDate);

    function setupDate(dt) {
      // ensure date has the same date as start time
      dt.setFullYear(startDate.getFullYear());
      dt.setMonth(startDate.getMonth());
      dt.setDate(startDate.getDate());
      // remove seconds and milliseconds
      dt.setSeconds(0);
    }
    setupDate(_this.item.StartOn);
    setupDate(_this.item.EndOn);

    _this.data = ukov.wrap(_this.item, schema);

    _this.position = ko.computed({
      deferEvaluation: true,
      read: function() {
        _this.data.StartOn(); // subscribe
        var row = _this.board.timeToRow(_this.data.model.StartOn);
        return {
          top: row * _this.board.rowHeight,
          left: "0px",
        };
      },
      write: function(position) {
        var startOn = _this.data.model.StartOn;
        var endOn = _this.data.model.EndOn;
        // find delta between StartOn and EndOn
        var delta = endOn.valueOf() - startOn.valueOf();

        // convert from screen position to time
        startOn = _this.board.topToTime(startOn, position.top);
        _this.data.StartOn(startOn);
        endOn = new Date(startOn.valueOf() + delta);
        _this.data.EndOn(endOn);
      },
    });
    _this.height = ko.computed({
      deferEvaluation: true,
      read: function() {
        _this.data.StartOn(); // subscribe
        _this.data.EndOn(); // subscribe
        return _this.board.timeToHeight(_this.data.model.StartOn, _this.data.model.EndOn);
      },
      write: function(height) {
        var endOn = _this.board.heightToTime(_this.data.model.StartOn, _this.data.model.EndOn, height);
        _this.data.EndOn(endOn);
      },
    });

    _this.timespan = ko.computed(function() {
      var data = _this.data;
      data.StartOn(); // subscribe
      data.EndOn(); // subscribe
      return calcTimespan(data.model);
    });


    _this.selected = ko.observable(false);


    //
    //events
    //
    _this.clickCancel = utils.noop; //@NOTE: to be set by owner
    _this.cmdSave = ko.command(function(cb) {
      saveAppt(_this, cb);
    });
  }
  utils.inherits(ApptEditorViewModel, BaseViewModel);
  ApptEditorViewModel.prototype.viewTmpl = "tmpl-scheduler-appt-editor";

  // function closeLayer(_this) {
  //   if (_this.layer) {
  //     _this.layer.close();
  //   }
  // }

  function saveAppt(_this, cb) {
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb(_this.data.errMsg());
      return;
    }

    var model = _this.data.getValue();
    dataservice.ticketsrv.appointments.save({
      id: model.ID || "", // if no value then create, else update
      data: model,
    }, null, utils.safeCallback(cb, function(err, resp) {
      _this.data.markClean(resp.Value, true);
      // _this.layerResult = resp.Value;
      // closeLayer(_this);
    }, notify.iferror));
  }

  function toCalendarItem(item, board, css, editable) {
    if (editable) {
      return new ApptEditorViewModel({
        css: css,
        editable: true,
        item: item,
        board: board,
      });
    }
    return {
      css: css,
      editable: false,
      selected: false,
      item: item,
      position: {
        top: board.timeToRow(item.StartOn) * board.rowHeight,
        left: "0px",
      },
      height: board.timeToHeight(item.StartOn, item.EndOn),
      timespan: calcTimespan(item),
    };
  }
  ApptEditorViewModel.toCalendarItem = toCalendarItem;

  function calcTimespan(model) {
    return strings.format("{0:t} - {1:t}", model.StartOn, model.EndOn);
  }

  return ApptEditorViewModel;
});
