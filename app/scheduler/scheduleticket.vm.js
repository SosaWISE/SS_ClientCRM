define("src/scheduler/scheduleticket.vm", [
  "moment",
  "src/dataservice",
  "src/scheduler/scheduler-helper",
  "src/scheduler/month.vm",
  "src/scheduler/calcol",
  "src/scheduler/calitem",
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
  schedulerhelper,
  MonthViewModel,
  CalCol,
  CalItem,
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
      "ticketVm",
    ]);

    _this.hasAppt = _this.ticketVm.data.model.AppointmentId > 0;

    _this.board = new DayBoard();
    if (!_this.hasAppt) {
      _this.board.onAdd = function(top, columnVm) {
        var startOn = _this.board.topToTime(_this.monthVm.selectedDate.peek(), top);
        var endOn = moment(startOn).add("hour", 1).toDate();

        _this.ticketVm.data.StartOn(startOn);
        _this.ticketVm.data.EndOn(endOn);
        _this.ticketVm.data.TechId(columnVm.ID);

        var calItem = CalItem.create(_this.board, _this.ticketVm.data);

        // calItem.onCancel = function() {
        //   if (calItem.data.model.AppointmentId) {
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
      };

    }
    _this.monthVm = new MonthViewModel();
    // _this.dayTechs = ko.observableArray();


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
    var afterLoaded;

    if (_this.hasAppt) {
      // load tech for appointment

      // get ticket
      var ticket = _this.ticketVm.data.model;

      // load service ticket tech
      dataservice.ticketsrv.techs.read({
        id: ticket.TechId,
      }, function(tech) {
        _this.techs = [tech];
        loadTechWeekDays(tech, join.add());
      }, join.add());

      afterLoaded = function() {
        _this.monthVm.selectedDate(ticket.StartOn);
        selectedDateChanged.call(_this, ticket.StartOn);
      };
    } else {
      // load all techs

      //@REVIEW: need more sophisticated tech query
      dataservice.ticketsrv.techs.read({}, function(val) {
        _this.techs = val.filter(function(tech) {
          // only techs with an id (it needs to exist in TS_ tables)
          return tech.ID;
        });

        // get weekdays for each tech
        _this.techs.forEach(function(tech) {
          loadTechWeekDays(tech, join.add());
        });
      }, join.add());

      afterLoaded = function() {
        _this.monthVm.selectedDate.subscribe(selectedDateChanged, _this);
        // fire event
        selectedDateChanged.call(_this, _this.monthVm.selectedDate.peek());
      };
    }

    _this.board.busy(true);
    join.when(function(err) {
      _this.board.busy(false);
      if (!err) {
        afterLoaded();
      }
    });
  };

  function selectedDateChanged(selectedDate) {
    /* jshint validthis:true */
    var _this = this;
    // clear
    _this.board.columns([]);

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
    // _this.dayTechs(dayTechs);

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

      var items = [];
      dayTechs.forEach(function(tech) {
        items = items.concat(tech.weekGones[day].map(function(item) {
          item.ColumnID = tech.ID;
          return CalItem.create(_this.board, item);
        }));
        items = items.concat(techDayApptsMap[tech.ID].map(function(item) {
          var vm;
          if (item.AppointmentId === _this.ticketVm.data.model.AppointmentId) {
            vm = CalItem.create(_this.board, _this.ticketVm.data);
            _this.board.selectedVm(vm);
          } else {
            schedulerhelper.ensureTypeNames(item);
            item.ColumnID = item.TechId;
            // item.ColumnID = tech.ID;
            vm = CalItem.create(_this.board, item);
          }
          return vm;
        }));
      });
      _this.board.items(items);
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
