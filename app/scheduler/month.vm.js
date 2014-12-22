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
  ko.bindingHandlers.month = {
    init: function(el, valueAccessor, allBindingsAccessor, viewModel) {
      viewModel = viewModel;
      var currApptVm = null;
      var dragInfo = null;
      var $scrollEl = jquery(el).parent();

      function deselect() {
        currApptVm.selected(false);
        viewModel.editorVm(currApptVm = null);
      }

      function initDragInfo($target, apptVm, parentEl, evt) {
        var moveEl = jquery(parentEl);

        moveEl.addClass("dragging");
        dragInfo = {
          moveEl: moveEl,
          apptVm: apptVm,
          resize: $target.hasClass("resizer"),
          startTop: apptVm.position.peek().top,
          startHeight: apptVm.height.peek(),
          startY: evt.clientY - (parseInt(moveEl.css("top"), 10) || 0) - $scrollEl.scrollTop(),
        };
      }

      jquery(el).mouseup(function() {
        if (dragInfo) {
          dragInfo.moveEl.removeClass("dragging");
          dragInfo = null;
        }
      }).mousedown(function(evt) {
        if (evt.button !== 0) { // 0-left mouse click
          // not a left mouse click
          return;
        }
        evt.preventDefault();
        evt.stopImmediatePropagation();

        var $target = jquery(evt.target);
        if ($target.hasClass("column") || // clicked on column border
          $target.hasClass("gone")) { // ignore gone items
          return;
        }

        //
        var parentEl = ($target.hasClass("appt") ? $target : $target.parent("dl.appt"))[0];
        var apptVm = parentEl ? ko.dataFor(parentEl) : null;

        if (currApptVm) {
          if (currApptVm === apptVm) {
            // clicked the same one, start dragging
            initDragInfo($target, apptVm, parentEl, evt);
            return;
          } else if (!currApptVm.data.isClean()) {
            notify.warn("Appointment has unsaved changes", "Save or cancel the currently selected appointment.", 5);
            return;
          } else {
            // nothing to save so deselect the current and select the new
            deselect();
          }
        }

        //
        if (!apptVm) {
          return;
        }
        //
        apptVm.selected(true);
        currApptVm = apptVm;
        currApptVm.layer = {
          close: deselect,
        };
        viewModel.editorVm(currApptVm);

        //for now only allow dragging after the item has been selected
        // initDragInfo($target, apptVm, parentEl, evt);
      });

      jquery(document).mousemove(function(evt) {
        if (!dragInfo) {
          return;
        }
        var top = evt.clientY - dragInfo.startY + $scrollEl.scrollTop();
        if (dragInfo.resize) {
          dragInfo.apptVm.height(dragInfo.startHeight + (top - dragInfo.startTop));
        } else {
          // indirectly set position
          dragInfo.apptVm.position({
            top: top,
          });
          // // directly set position
          // dragInfo.moveEl.css({
          //   top: top,
          // });
        }
      });
    }
  };

  // Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
  // Could be stored in a separate utility library
  ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
      // Initially set the element to be instantly visible/hidden depending on the value
      var value = valueAccessor();
      jquery(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
      element = jquery(element);
      var value = ko.unwrap(valueAccessor());
      if (value) {
        element.fadeIn();
      } else {
        element.fadeOut();
      }
    }
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
    _this.weekDays = new Array(i);
    var d = moment();
    while (i--) {
      _this.weekDays[i] = {
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
      year = dt.year(),
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
      day.today(now.year() === year && now.month() === month && now.date() === date);

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
