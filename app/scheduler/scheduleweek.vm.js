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

  function ScheduleWeekViewModel(options) {
    var _this = this;
    ScheduleWeekViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
    ]);

    _this.rows = ko.observableArray([]);
    _this.columns = ko.observableArray([]);

    var i;
    var rowHeight = 20;
    var twoRowHeight = rowHeight * 2;
    for (i = 0; i < 24; i++) {
      _this.rows.push({
        num: i,
        beginsHour: i % 2 === 0,
        position: {
          top: twoRowHeight * i,
        },
        height: rowHeight,
      });
    }
    _this.totalHeight = _this.rows.peek().length * twoRowHeight;

    //
    for (i = 0; i < 3; i++) {
      _this.columns.push({
        num: i,
        width: "33.3%",
      });
    }

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

  return ScheduleWeekViewModel;
});
