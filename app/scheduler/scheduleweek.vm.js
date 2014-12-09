define("src/scheduler/scheduleweek.vm", [
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var rowHeight = 20;
  var twoRowHeight = rowHeight * 2;
  // var halfRowHeight = rowHeight / 2;

  //
  //
  //


  //
  //
  //
  function ScheduleWeekViewModel(options) {
    var _this = this;
    ScheduleWeekViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
    ]);
    utils.setIfNull(_this, {
      startHour: 6,
      endHour: 24,
    });

    _this.rows = ko.observableArray([]);
    _this.columns = ko.observableArray([]);

    var i, length, row;
    length = (_this.endHour - _this.startHour) * 2;
    for (i = 0; i < length; i++) {
      row = i * 2;
      _this.rows.push({
        index: i,
        beginsHour: i % 2 === 0,
        position: {
          top: row * rowHeight,
        },
        height: rowHeight,
      });
    }
    _this.totalHeight = _this.rows.peek().length * twoRowHeight;

    function toCalendarItem(item) {
      var row = timeToRow(_this.startHour, item.StartTime);
      var nRows = timeToRow(_this.startHour, item.EndTime, _this.endHour) - row;
      return {
        item: item,
        position: {
          top: row * rowHeight,
          left: "0px",
        },
        height: Math.max(5, nRows * rowHeight),
      };
    }

    function dayTechToColumn(tech) {
      return {
        tech: tech,
        gones: tech.gones ? tech.gones.map(toCalendarItem) : [],
        appts: tech.appts ? tech.appts.map(toCalendarItem) : [],
      };
    }

    // techs on selected day
    var dayTechs = [ //
      {
        name: "Bob",
        gones: [ //
          {
            StartTime: null,
            EndTime: new Date(2000, 1, 1, 6, 45, 0, 0),
          }, {
            StartTime: new Date(2000, 1, 1, 17, 0, 0, 0),
            EndTime: null,
          },
        ],
        appts: [ //
          {
            StartTime: new Date(2000, 1, 1, 6, 45, 0, 0),
            EndTime: new Date(2000, 1, 1, 7, 30, 0, 0),
          },
        ],
      }, {
        name: "Hank",
        gones: [ //
          {
            StartTime: null,
            EndTime: new Date(2000, 1, 1, 8, 0, 0, 0),
          },
        ],
      }, {
        name: "Frank",
      },
    ];
    _this.columns(dayTechs.map(dayTechToColumn));
    _this.columnWidth = ko.computed(function() {
      var length = _this.columns().length;
      return (100 / length) + "%";
    });

    _this.getTime = function(index) {
      if (index % 2 !== 0) {
        return "";
      }
      var hour = index / 2 + _this.startHour;
      var v = hour < 12 ? "am" : "pm";
      if (hour > 12) {
        hour -= 12;
      }
      return hour + v;
    };

    //
    //events
    //
  }

  utils.inherits(ScheduleWeekViewModel, ControllerViewModel);
  ScheduleWeekViewModel.prototype.viewTmpl = "tmpl-scheduler-scheduleweek";

  //
  // members
  //

  ScheduleWeekViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    //var _this = this;
    join = join;
  };


  function timeToRow(startHour, dt, endHour) {
    var hours, minutes = 0;
    if (dt) {
      hours = dt.getHours();
      minutes = dt.getMinutes();
    } else {
      hours = (endHour) ? endHour : startHour;
    }
    // only uses hours and minutes
    // one row for every 15 minute period
    return ((hours - startHour) * 4) + Math.floor(minutes / 15);
  }
  ScheduleWeekViewModel.timeToRow = timeToRow; // expose for specs

  return ScheduleWeekViewModel;
});
