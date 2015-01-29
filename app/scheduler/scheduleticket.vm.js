define("src/scheduler/scheduleticket.vm", [
  "moment",
  "src/dataservice",
  "src/scheduler/scheduler-helper",
  "src/scheduler/month.vm",
  "src/scheduler/calcol",
  "src/scheduler/calitem",
  "src/scheduler/calboard",
  "jquery",
  "ko",
  "src/core/joiner",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  moment,
  dataservice,
  schedulerhelper,
  MonthViewModel,
  CalCol,
  CalItem,
  CalBoard,
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
      "ticketVm",
    ]);

    _this.hasAppt = function() {
      return _this.ticketVm.data.AppointmentId.peek() > 0;
    };

    _this.monthVm = new MonthViewModel();
    var startOn = _this.ticketVm.data.StartOn.getValue();
    if (startOn) {
      _this.monthVm.selectedDate(startOn);
    }
    _this.board = new CalBoard({
      selectedDate: _this.monthVm.selectedDate,
      onAdd: function(top, columnVm) {
        if (_this.hasAppt()) {
          return;
        }

        var startOn = _this.board.topToTime(_this.monthVm.selectedDate.peek(), top);
        var endOn = moment(startOn).add("hour", 1).toDate();

        _this.ticketVm.data.StartOn(startOn);
        _this.ticketVm.data.EndOn(endOn);
        _this.ticketVm.data.TechId(columnVm.ID);

        var calItem = CalItem.create(_this.board, _this.ticketVm.data);

        // calItem.onCancel = function() {
        //   if (calItem.data.AppointmentId.peek()) {
        //     return;
        //   }
        //   // remove from list
        //   var index = columnVm.items.indexOf(calItem);
        //   if (index < 0) {
        //     return;
        //   }
        //   columnVm.items.splice(index, 1);
        // };

        // add to list
        _this.board.items.push(calItem);

        return calItem;
      }
    });


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

    if (_this.hasAppt()) {
      // set selectedDate now, but notify when loaded
      _this.monthVm.selectedDate(_this.ticketVm.data.StartOn.peek());
    }
    // load all techs
    //@REVIEW: need more sophisticated tech query
    dataservice.ticketsrv.techs.read({}, function(val) {
      _this.techs = val.filter(function(tech) {
        return tech.ID; // only techs with an id (it needs to exist in TS_ tables)
      });
      // get weekdays for each tech
      _this.techs.forEach(function(tech) {
        loadTechWeekDays(tech, join.add());
      });
    }, join.add());

    _this.board.busy(true);
    join.when(function(err) {
      _this.board.busy(false);
      if (!err) {
        _this.monthVm.selectedDate.subscribe(selectedDateChanged, _this);
        // fire event
        selectedDateChanged.call(_this, _this.monthVm.selectedDate.peek());
      }
    });
  };

  ScheduleTicketViewModel.prototype.firstOverlapItem = function(testItem) {
    var _this = this;
    return _this.board.firstOverlapItem(testItem);
  };

  function selectedDateChanged(selectedDate) {
    /* jshint validthis:true */
    var _this = this;
    if (!_this.monthVm.isDateSelected(selectedDate)) {
      // abort if the date has since changed
      return;
    }
    // clear
    _this.board.columns([]);
    _this.board.items([]);

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
    _this.ticketVm.data.techCvm.setList(dayTechs);

    _this.board.busy(true);
    join.when(function(err) {
      _this.board.busy(false);
      if (notify.iferror(err) || !_this.monthVm.isDateSelected(selectedDate)) {
        // abort if the date has since changed
        return;
      }

      var columns = dayTechs.map(function(tech, index) {
        return CalCol.create(_this.board, index, tech.ID, tech.FullName);
      });
      _this.board.columns(columns);

      var selectedVm = _this.board.selectedVm.peek();
      var items = [];
      dayTechs.forEach(function(tech) {
        tech.weekGones[day].forEach(function(item) {
          item.ColumnID = tech.ID;
          var vm = CalItem.create(_this.board, item);
          items.push(vm);
        });

        techDayApptsMap[tech.ID].forEach(function(item) {
          var vm;
          if (item.AppointmentId === _this.ticketVm.data.AppointmentId.peek()) {
            if (selectedVm) {
              if (item.AppointmentId !== selectedVm.data.AppointmentId.peek()) {
                console.warn("AppointmentId mismatch");
              }
              return;
            }
            vm = CalItem.create(_this.board, _this.ticketVm.data);
            selectedVm = vm;
          } else {
            schedulerhelper.ensureTypeNames(item);
            item.ColumnID = item.TechId;
            // item.ColumnID = tech.ID;
            vm = CalItem.create(_this.board, item);
          }
          items.push(vm);
        });
      });
      if (selectedVm) {
        items.push(selectedVm);
      }
      _this.board.items(items);
      _this.board.selectedVm(selectedVm);
      if (selectedVm) {
        selectedVm.scrollTo(true);
      }
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

  function loadTechAppts(techID, dt, setter, cb) {
    var start = moment([dt.getFullYear(), dt.getMonth(), dt.getDate()]);
    var end = start.clone().add(1, "d").subtract(3, "ms");
    dataservice.ticketsrv.techs.read({
      id: techID,
      link: "Appointments",
      query: {
        start: start.utc().format(),
        end: end.utc().format(),
      },
    }, setter, cb);
  }

  function loadTechWeekDays(tech, cb) {
    dataservice.ticketsrv.techs.read({
      id: tech.ID,
      link: "weekdays",
    }, function(weekdays) {
      // convert weekdays to gones
      tech.weekGones = convertWeekDaysToWeekGones(weekdays);
    }, cb);
  }


  return ScheduleTicketViewModel;
});
