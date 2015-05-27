define("src/scheduler/scheduleticket.vm", [
  "moment",
  "dataservice",
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

    // load all teams
    var allTeams;
    dataservice.api_ticket.teams.read({}, function(val) {
      allTeams = val.filter(function(item) {
        return !!item.Address; // only teams with an Address
      });
    }, join.add());
    // load all techs
    //@REVIEW: need more sophisticated tech query
    dataservice.ticketsrv.techs.read({}, function(val) {
      _this.techs = val.filter(function(item) {
        return item.ID; // only techs with an id (it needs to exist in TS_ tables)
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
        // only teams with a tech
        var lat1 = _this.ticketVm.data.model.Latitude;
        var lon1 = _this.ticketVm.data.model.Longitude;
        var teams = allTeams.filter(function(team) {
          return _this.techs.some(function(tech) {
            if (team.TeamId === tech.TeamId) {
              // also, calculate the distance from address
              var lat2 = team.Address.Latitude;
              var lon2 = team.Address.Longitude;
              // only calculate distance if both points are known
              if (lat1 !== 0 && lat2 !== 0) {
                team.distance = haversineDistance(lat2, lon2, lat1, lon1);
              }
              return true;
            }
          });
        }).sort(function(a, b) {
          // sort by calculated distance
          // invalid distances go to the end
          if (a.distance == null && b.distance == null) {
            if (a.Team.Description < b.Team.Description) {
              return -1;
            } else if (b.Team.Description < a.Team.Description) {
              return 1;
            } else {
              return 0;
            }
          }
          if (a.distance == null) {
            return 1;
          }
          if (b.distance == null) {
            return -1;
          }
          return a.distance - b.distance;
        });
        _this.ticketVm.data.teamCvm.setList(teams);
        var tempTech = _this.ticketVm.data.techCvm.selectedItem();
        if (tempTech) {
          _this.techs.some(function(tech) {
            if (tech.ID === tempTech.ID) {
              _this.ticketVm.data.teamCvm.selectedValue(tech.TeamId);
              return true;
            }
          });
        }
        if (!_this.ticketVm.data.teamCvm.selectedValue.peek()) {
          _this.ticketVm.data.teamCvm.selectFirst();
        }
        // wire events
        _this.ticketVm.data.teamCvm.selectedValue.subscribe(selectedTeamChanged, _this);
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

  function haversineDistance(lat1, lon1, lat2, lon2, R) {
    // R = R || 6371; // default radius the mean radius of earth in km
    R = R || 3958.761; // default radius the mean radius of earth in miles
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * Math.PI / 180;
  }

  function selectedTeamChanged(teamID) {
    /* jshint validthis:true */
    var _this = this;
    var selectedDate = _this.monthVm.selectedDate.peek();
    updateTechAndBoard(_this, teamID, selectedDate);
  }

  function selectedDateChanged(selectedDate) {
    /* jshint validthis:true */
    var _this = this;
    var teamID = _this.ticketVm.data.teamCvm.selectedValue.peek();
    updateTechAndBoard(_this, teamID, selectedDate);
  }

  function updateTechAndBoard(_this, teamID, selectedDate) {
    if (_this.ticketVm.data.teamCvm.selectedValue.peek() !== teamID ||
      !_this.monthVm.isDateSelected(selectedDate)) {
      // abort if the team or date has since changed
      return;
    }

    // clear
    _this.board.columns([]);
    _this.board.items([]);

    var day = selectedDate.getDay();

    var join = joiner();
    var techDayApptsMap = {};
    var teamDayTechs = _this.techs.filter(function(tech) {
      var working = tech.TeamId === teamID &&
        tech.weekGones[day].some(function(gone) {
          return (gone.StartOn || gone.EndOn);
        });
      if (working) {
        // get appointments
        loadTechAppts(tech.ID, selectedDate, function(items) {
          items.forEach(schedulerhelper.afterTicketLoaded);
          techDayApptsMap[tech.ID] = items;
        }, join.add());
      }
      return working;
    });
    _this.ticketVm.data.techCvm.setList(teamDayTechs);
    // if (!_this.ticketVm.data.techCvm.selectedValue.peek()) {
    //   _this.ticketVm.data.techCvm.selectFirst();
    // }

    _this.board.busy(true);
    join.when(function(err) {
      _this.board.busy(false);
      if (notify.iferror(err) ||
        _this.ticketVm.data.teamCvm.selectedValue.peek() !== teamID ||
        !_this.monthVm.isDateSelected(selectedDate)) {
        // abort if the team or date has since changed
        return;
      }

      var columns = teamDayTechs.map(function(tech, index) {
        return CalCol.create(_this.board, index, tech.ID, tech.FullName);
      });
      _this.board.columns(columns);

      var selectedVm = _this.board.selectedVm.peek();
      var items = [];
      teamDayTechs.forEach(function(tech) {
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
    var map = {};
    weekdays.forEach(function(wday) {
      map[wday.WeekDay] = wday;
    });
    for (var i = 0; i < 7; i++) {
      var wday = map[i];
      var gones;
      if (wday && wday.StartTime) {
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

      weekGones[i] = gones;
    }
    return weekGones;
  }

  function loadTechAppts(techID, dt, setter, cb) {
    var start = moment.utc([dt.getFullYear(), dt.getMonth(), dt.getDate()]);
    var end = start.clone().add(1, "d").subtract(3, "ms");
    dataservice.ticketsrv.techs.read({
      id: techID,
      link: "Appointments",
      query: {
        start: start.format(),
        end: end.format(),
      },
    }, setter, cb);
  }

  function loadTechWeekDays(tech, cb) {
    dataservice.ticketsrv.techs.read({
      id: tech.ID,
      link: "weekdays",
    }, function(weekdays) {
      weekdays.forEach(schedulerhelper.afterTechWeekDayLoaded);
      // convert weekdays to gones
      tech.weekGones = convertWeekDaysToWeekGones(weekdays);
    }, cb);
  }


  return ScheduleTicketViewModel;
});
