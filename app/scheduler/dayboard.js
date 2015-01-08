define("src/scheduler/dayboard", [
  "src/scheduler/appt.editor.vm",
  "jquery",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ApptEditorViewModel,
  jquery,
  ko,
  notify,
  utils
) {
  "use strict";

  //
  //
  //
  function DayBoard(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }
    utils.setIfNull(_this, {
      startHour: 0,
      endHour: 24,
      rowHeight: 7,
    });
    // used in dayboard binding
    _this.selectedVm = ko.observable();

    // number of half hours
    _this.halfHourRowHeight = _this.rowHeight * 6;
    _this.halfHourRows = [];
    var length = (_this.endHour - _this.startHour) * 2;
    for (var i = 0; i < length; i++) {
      var row = i * 6;
      _this.halfHourRows.push({
        index: i,
        beginsHour: i % 6 === 0,
        position: {
          top: row * _this.rowHeight,
        },
        height: _this.halfHourRowHeight,
      });
    }
    _this.totalHeight = _this.halfHourRows.length * _this.halfHourRowHeight;

    _this.getTime = function(index) {
      if (index % 2 !== 0) {
        return "";
      }
      var hour = index / 2 + _this.startHour;
      var v = hour < 12 ? "am" : "pm";
      if (hour === 0) {
        hour = 12;
      } else if (hour > 12) {
        hour -= 12;
      }
      return hour + v;
    };
  }
  DayBoard.prototype.viewTmpl = "tmpl-scheduler-dayboard";

  //
  // members
  //

  DayBoard.prototype.rowToTicks = function(row) {
    var _this = this;
    row = Math.floor(row);
    var div = (row / 12);
    var hours = Math.floor(div);
    var minutes = Math.round((div - hours) * 60);
    return ((hours + _this.startHour) * 3600000) + (minutes * 60000);
  };
  DayBoard.prototype.timeToRow = function(dt, defaultHour) {
    var _this = this;
    var hours, minutes = 0;
    if (utils.isDate(dt)) {
      hours = dt.getHours();
      minutes = dt.getMinutes();
    } else {
      hours = (defaultHour) ? defaultHour : _this.startHour;
    }
    // only uses hours and minutes
    // one row for every 5 minute period
    return ((hours - _this.startHour) * 12) + Math.floor(minutes / 5);
  };

  DayBoard.prototype.topToTime = function(dt, top) {
    var _this = this;
    var row = Math.floor(top / _this.rowHeight);
    var timeTicks = _this.rowToTicks(row);
    // clone date
    dt = new Date(dt.valueOf());
    dt.setHours(0, 0, 0, 0); // remove time from date
    return new Date(dt.valueOf() + timeTicks);
  };
  DayBoard.prototype.heightToTime = function(startDt, dt, height) {
    var _this = this;
    var nRows = height / _this.rowHeight;
    var row = _this.timeToRow(startDt);
    var timeTicks = _this.rowToTicks(nRows + row);
    // clone date
    dt = new Date(dt.valueOf());
    dt.setHours(0, 0, 0, 0); // remove time from date
    return new Date(dt.valueOf() + timeTicks);
  };
  DayBoard.prototype.timeToHeight = function(startDt, endDt) {
    var _this = this;
    var row = _this.timeToRow(startDt);
    var nRows = _this.timeToRow(endDt, _this.endHour) - row;
    return Math.max(5, nRows * _this.rowHeight);
  };

  //
  //
  //

  //
  // ui bindings
  //
  ko.bindingHandlers.dayboard = {
    init: function(el, valueAccessor) {
      var dayboardVm = ko.unwrap(valueAccessor());
      var currVm = dayboardVm.selectedVm.peek();
      var dragInfo = null;
      var $scrollEl = jquery(el).parent();

      function deselect() {
        currVm.selected(false);
        currVm.data.reset();
        dayboardVm.selectedVm(currVm = null);
      }

      function initDragInfo($target, vm, moveEl, evt) {
        moveEl = jquery(moveEl);

        moveEl.addClass("dragging");
        dragInfo = {
          moveEl: moveEl,
          vm: vm,
          resize: $target.hasClass("resizer"),
          startTop: vm.position.peek().top,
          startHeight: vm.height.peek(),
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
        if ( //$target.hasClass("column") || // clicked on column border
          $target.hasClass("gone")) { // ignore gone items
          return;
        }

        //
        var moveEl = ($target.hasClass("editable") ? $target : $target.parent("dl.editable"))[0];
        var vm = moveEl ? ko.dataFor(moveEl) : null;

        if (currVm) {
          if (!vm) {
            return;
          }

          if (currVm === vm) {
            // clicked the same one, start dragging
            initDragInfo($target, vm, moveEl, evt);
            return;
          } else if (!currVm.data.isClean()) {
            notify.warn("Appointment has unsaved changes", "Save or cancel the currently selected appointment.", 5);
            return;
          } else {
            // nothing to save so deselect the current and select the new
            deselect();
          }
        } else if (!vm) {
          if (!dayboardVm.onAdd) {
            return;
          }

          var colEl = ($target.hasClass("column") ? $target : $target.parent("dl.editable"))[0];
          var columnVm = colEl ? ko.dataFor(colEl) : null;
          if (!columnVm) {
            return;
          }

          vm = dayboardVm.onAdd(evt.clientY - $scrollEl.offset().top + $scrollEl.scrollTop(), columnVm);
        }

        //
        vm.selected(true);
        currVm = vm;
        // override clickCancel
        (function() {
          var prevClick = currVm.clickCancel;
          currVm.clickCancel = function() {
            currVm.clickCancel = prevClick;

            if (utils.isFunc(currVm.onCancel)) {
              currVm.onCancel();
            }
            // reset data
            currVm.data.reset();
          };
        })();
        dayboardVm.selectedVm(currVm);

        //for now only allow dragging after the item has been selected
        // initDragInfo($target, vm, moveEl, evt);
      });

      jquery(document).mousemove(function(evt) {
        if (!dragInfo) {
          return;
        }
        var top = evt.clientY - dragInfo.startY - $scrollEl.scrollTop();
        top = Math.max(top, 0);

        if (dragInfo.resize) {
          dragInfo.vm.height(dragInfo.startHeight + (top - dragInfo.startTop));
        } else {
          // top = Math.min(top, dayboardVm.totalHeight - dragInfo.startHeight); // - dayboardVm.rowHeight);
          top = Math.min(top, dayboardVm.totalHeight - dragInfo.startHeight - dayboardVm.rowHeight);
          // indirectly set position
          dragInfo.vm.position({
            top: top,
          });
        }
      });
    }
  };

  return DayBoard;
});
