define("src/scheduler/scheduleticket.vm", [
  "moment",
  "src/dataservice",
  "src/scheduler/month.vm",
  "src/scheduler/appt.editor.vm",
  "src/scheduler/dayboard",
  "jquery",
  "ko",
  "src/core/joiner",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  moment,
  dataservice,
  MonthViewModel,
  ApptEditorViewModel,
  DayBoard,
  jquery,
  ko,
  joiner,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  //
  //
  //
  function ScheduleTicketViewModel(options) {
    var _this = this;
    ScheduleTicketViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      // "layersVm",
      "ticket",
    ]);

    _this.board = new DayBoard({
      onAdd: function(top, columnVm) {
        var startOn = _this.board.topToTime(_this.monthVm.selectedDate.peek(), top);
        var endOn = moment(startOn).add("hour", 1).toDate();

        var apptVm = ApptEditorViewModel.toCalendarItem({
          // ID: null,
          // AppointmentId: null,
          // Version: 0,
          ServiceTicketId: _this.ticket.ID,
          TechId: columnVm.tech.ID,
          StartOn: startOn,
          EndOn: endOn,
        }, _this.board, "appt", true);

        apptVm.onCancel = function() {
          if (apptVm.data.model.AppointmentId) {
            return;
          }
          // remove from list
          var index = columnVm.items.indexOf(apptVm);
          columnVm.items.splice(index, 1);
        };

        // add to list
        columnVm.items.push(apptVm);

        return apptVm;
      },
    });
    _this.columns = ko.observableArray([]);
    _this.busy = ko.observable(false);

    _this.columnWidth = ko.computed(function() {
      var length = _this.columns().length || 1;
      return (100 / length) + "%";
    });

    _this.dayTechs = ko.observableArray();

    _this.monthVm = new MonthViewModel();

    //
    //events
    //
  }

  utils.inherits(ScheduleTicketViewModel, ControllerViewModel);
  ScheduleTicketViewModel.prototype.viewTmpl = "tmpl-scheduler-scheduleticket";

  //
  // members
  //

  ScheduleTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;

    //@REVIEW: need more sophisticated tech query
    dataservice.ticketsrv.techs.read({}, function(val) {
      _this.techs = val.filter(function(tech) {
        // only techs with an id (it needs to exist in TS_ tables)
        return tech.ID;
      });

      // get weekdays for each tech
      _this.techs.forEach(function(tech) {
        dataservice.ticketsrv.techs.read({
          id: tech.ID,
          link: "weekdays",
        }, function(weekdays) {
          // convert weekdays to gones
          tech.weekGones = convertWeekDaysToWeekGones(weekdays);
        }, join.add());
      });
    }, join.add());


    join.when(function(err) {
      if (!err) {
        _this.monthVm.selectedDate.subscribe(selectedDateChanged, _this);

        // set the selected date to now
        _this.monthVm.selectDate(new Date());
      }
    });
  };

  function selectedDateChanged(selectedDate) {
    /* jshint validthis:true */
    var _this = this;
    // clear
    _this.columns([]);

    var join = joiner();
    var day = selectedDate.getDay();

    var techDayApptsMap = {};
    // narrow techs to day of week
    var dayTechs = _this.techs.filter(function(tech) {
      var working = tech.weekGones[day].some(function(gone) {
        return (gone.StartOn || gone.EndOn);
      });
      if (working) {
        // get appointments
        loadTechAppts(tech.ID, selectedDate, function(appts) {
          techDayApptsMap[tech.ID] = appts;
        }, join.add());
      }
      return working;
    });
    _this.dayTechs(dayTechs);

    _this.busy(true);
    join.when(function(err) {
      _this.busy(false);
      if (err) {
        return notify.error(err);
      }

      _this.columns(dayTechs.map(function(tech) {
        var items = [];
        items = items.concat(tech.weekGones[day].map(function(item) {
          return ApptEditorViewModel.toCalendarItem(item, _this.board, "gone");
        }));
        items = items.concat(techDayApptsMap[tech.ID].map(function(item) {
          return ApptEditorViewModel.toCalendarItem(
            item, _this.board, "appt", item.ID === _this.apptID);
        }));

        return {
          tech: tech,
          items: ko.observableArray(items),
        };
      }));
    });
  }

  function convertWeekDaysToWeekGones(weekdays) {
    var weekGones = new Array(7);
    weekdays.forEach(function(wday) {
      var gones;
      if (wday.StartTime) {
        gones = [ //
          {
            StartOn: null,
            EndOn: wday.StartTime,
          }, {
            StartOn: wday.EndTime,
            EndOn: null,
          },
        ];
      } else {
        // gone all day
        gones = [ //
          {
            StartOn: null,
            EndOn: null,
          },
        ];
      }

      weekGones[wday.WeekDay] = gones;
    });
    return weekGones;
  }

  function loadTechAppts(techID, selectedDate, setter, cb) {
    dataservice.ticketsrv.techs.read({
      id: techID,
      link: "Appointments",
      query: {
        date: moment(selectedDate).format("MM/DD/YYYY"),
      },
    }, setter, cb);
  }


  return ScheduleTicketViewModel;
});
