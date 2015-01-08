define("src/scheduler/month.vm", [
  "moment",
  "jquery",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  moment,
  jquery,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  //
  // ui bindings
  //
  ko.bindingHandlers.fadein = {
    update: function(element, valueAccessor) {
      ko.unwrap(valueAccessor()); // subscribe to changes
      jquery(element).hide().fadeIn();
    },
  };

  var _totalDays = 42; // 7 wide, 6 tall

  //
  //
  //
  function MonthViewModel(options) {
    var _this = this;
    MonthViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      // "layersVm",
    ]);
    utils.setIfNull(_this, {

    });

    var i = _totalDays;
    _this.days = new Array(i);
    while (i--) {
      _this.days[i] = {
        date: ko.observable(),
        inMonth: ko.observable(),
        selected: ko.observable(),
        today: ko.observable(),
      };
    }
    i = 7;
    _this.weekdays = new Array(i);
    var d = moment();
    while (i--) {
      _this.weekdays[i] = {
        day: d.weekday(i).format("ddd"),
      };
    }


    _this.nowText = ko.observable();
    _this.selectedDate = ko.observable(new Date(0));
    _this.monthText = ko.computed(function() {
      return moment(_this.selectedDate()).format("MMMM");
    });
    _this.yearText = ko.computed(function() {
      return moment(_this.selectedDate()).format("YYYY");
    });

    //
    //events
    //
    _this.clickNow = function() {
      var now = new Date();
      _this.selectDate(now);
      _this.nowText(moment(now).format("LL"));
    };
    _this.clickYearDown = function() {
      changeYear(_this, false);
    };
    _this.clickYearUp = function() {
      changeYear(_this, true);
    };
    _this.clickMonthDown = function() {
      changeMonth(_this, false);
    };
    _this.clickMonthUp = function() {
      changeMonth(_this, true);
    };
    _this.clickDate = function(vm) {
      var date = vm.date.peek();
      if (!vm.inMonth.peek()) {
        // over 20 - previous month
        // under 20 - next month
        changeMonth(_this, (date > 20), date);
      } else {
        changeDate(_this, date);
      }
    };

    // start with today selected
    _this.clickNow();
  }

  utils.inherits(MonthViewModel, ControllerViewModel);
  MonthViewModel.prototype.viewTmpl = "tmpl-scheduler-month";

  //
  // members
  //

  MonthViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    //var _this = this;
    join = join;
  };


  MonthViewModel.prototype.selectDate = function(selectedDate) {
    var _this = this;
    var currDate = _this.selectedDate.peek();
    var date = selectedDate.getDate();
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), date);

    if (currDate.getFullYear() !== selectedDate.getFullYear() ||
      currDate.getMonth() !== selectedDate.getMonth()) {
      // set new month
      setMonthDays(_this.days, selectedDate);
    }
    // select the selected day
    _this.days.forEach(function(day) {
      day.selected(day.inMonth.peek() && day.date.peek() === date);
    });
    // set new selected date
    _this.selectedDate(selectedDate);
  };

  function setMonthDays(days, selectedDate, todaysDate) {
    var dt = moment(selectedDate),
      // year = dt.year(),
      month = dt.month(),
      date;
    // var selected = moment(selectedDate);
    var now = todaysDate ? moment(todaysDate) : moment();

    // set to first day on calendar (first day of month and then first day of week)
    dt.date(1).day(0);

    days.forEach(function(day) {
      date = dt.date();

      day.date(date);
      day.inMonth(dt.month() === month);
      day.today(now.year() === dt.year() && now.month() === dt.month() && now.date() === date);

      dt.add("days", 1);
    });
  }

  function changeYear(_this, prev) {
    var dt = _this.selectedDate.peek();
    _this.selectDate(new Date(
      dt.getFullYear() + (prev ? -1 : 1),
      dt.getMonth(),
      dt.getDate()
    ));
  }

  function changeMonth(_this, prev, date) {
    var dt = _this.selectedDate.peek();
    var year = dt.getFullYear();
    var month = dt.getMonth() + (prev ? -1 : 1);
    if (month < 0) {
      month = 11;
      year--;
    } else if (month > 11) {
      month = 0;
      year++;
    }
    _this.selectDate(new Date(
      year,
      month,
      date || dt.getDate()
    ));
  }

  function changeDate(_this, date) {
    var dt = _this.selectedDate.peek();
    _this.selectDate(new Date(
      dt.getFullYear(),
      dt.getMonth(),
      date
    ));
  }

  return MonthViewModel;
});
