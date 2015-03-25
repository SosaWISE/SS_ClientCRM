define("src/scheduler/calboard", [
  "jquery",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  jquery,
  ko,
  notify,
  utils
) {
  "use strict";

  //
  //
  //
  function CalBoard(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }
    utils.assertProps(_this, [
      "selectedDate",
      "onAdd",
    ]);
    utils.setIfNull(_this, {
      startHour: 0,
      endHour: 24,
      rowHeight: 7,
    });
    // used in calboard binding
    var internalVm = ko.observable();
    _this.selectedVm = ko.computed({
      deferEvaluation: true,
      read: function() {
        return internalVm();
      },
      write: function(vm) {
        var currVm = internalVm.peek();
        if (currVm) {
          currVm.selected(false);
        }
        if (vm) {
          vm.selected(true);
        }
        internalVm(vm);
      }
    });


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

    //
    _this.items = ko.observableArray([]);
    _this.columns = ko.observableArray([]);
    _this.columnWidth = ko.computed(function() {
      return calcColumnWidthPercent(_this) + "%";
    });

    //
    _this.busy = ko.observable(false);
  }
  CalBoard.prototype.viewTmpl = "tmpl-scheduler-calboard";

  //
  // members
  //
  CalBoard.prototype.getChildTemplate = function(vm) {
    return ko.unwrap(vm.viewTmpl);
  };

  CalBoard.prototype.rowToTicks = function(row) {
    var _this = this;
    row = Math.floor(row);
    var div = (row / 12);
    var hours = Math.floor(div);
    var minutes = Math.round((div - hours) * 60);
    return ((hours + _this.startHour) * 3600000) + (minutes * 60000);
  };
  CalBoard.prototype.timeToRow = function(dt, defaultHour) {
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

  CalBoard.prototype.topToTime = function(dt, top) {
    var _this = this;
    var row = Math.floor(top / _this.rowHeight);
    return addDateAndRow(_this, dt, row);
  };
  CalBoard.prototype.heightToTime = function(startDt, dt, height) {
    var _this = this;
    var nRows = height / _this.rowHeight;
    var row = _this.timeToRow(startDt);
    return addDateAndRow(_this, dt, nRows + row);
  };
  CalBoard.prototype.timeToHeight = function(startDt, endDt) {
    var _this = this;
    var row = _this.timeToRow(startDt);
    var nRows = _this.timeToRow(endDt, _this.endHour) - row;
    return Math.max(5, nRows * _this.rowHeight);
  };

  CalBoard.prototype.getColLeftPercent = function(colID) {
    var _this = this;
    var index = 0;
    _this.columns.peek().some(function(c, i) {
      if (c.ID === colID) {
        index = i;
      }
    });
    return (calcColumnWidthPercent(_this) * index) + "%";
  };

  CalBoard.prototype.firstOverlapItem = function(testItem) {
    var result;
    var _this = this;
    _this.items.peek().some(function(item) {
      if (item.overlaps(testItem, true)) {
        result = item;
        return true;
      }
    });
    return result;
  };

  function addDateAndRow(_this, dt, row) {
    var timeTicks = _this.rowToTicks(row);
    // clone date
    dt = new Date(dt.valueOf());
    dt.setHours(0, 0, 0, 0); // remove time from date
    return new Date(dt.valueOf() + timeTicks);
  }

  function calcColumnWidthPercent(_this) {
    var ncolumns = Math.max(_this.columns().length, 2); // minimum of 2 wide
    return 100 / ncolumns;
  }


  //
  //
  //

  //
  // ui bindings
  //
  ko.bindingHandlers.calboard = {
    init: function(el, valueAccessor) {
      var calboardVm = ko.unwrap(valueAccessor());
      var dragInfo = null;
      var $scrollEl = jquery(el);

      function deselectCurrent() {
        var vm = calboardVm.selectedVm.peek();
        if (vm) {
          vm.data.reset();
          calboardVm.selectedVm(null);
        }
      }

      function initDragInfo($target, vm, moveEl, evt) {
        moveEl = jquery(moveEl);

        // var moveElOffset = moveEl.offset();
        var startPosition = vm.position.peek();

        moveEl.addClass("dragging");
        dragInfo = {
          moveEl: moveEl,
          vm: vm,
          resize: $target.hasClass("resizer"),
          startTop: startPosition.top,
          // startLeft: startPosition.left,
          colID: startPosition.ColumnID,
          startHeight: vm.height.peek(),
          startY: evt.clientY - (parseInt(moveEl.css("top"), 10) || 0) - $scrollEl.scrollTop(),
          // startY: evt.clientY - moveElOffset.top - $scrollEl.scrollTop(),
          // startX: evt.clientX - (parseInt(moveEl.css("left"), 10) || 0) - $scrollEl.scrollLeft(),
          // startX: evt.clientX - moveElOffset.left - $scrollEl.scrollLeft(),
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
        var moveEl = ($target.hasClass("editable") ? $target : $target.parents(".calitem.editable"))[0];
        var vm = moveEl ? ko.dataFor(moveEl) : null;

        var currVm = calboardVm.selectedVm.peek();
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
            deselectCurrent();
          }
        } else if (!vm) {
          var colEl = $target.hasClass("column") ? $target[0] : null;
          var columnVm = colEl ? ko.dataFor(colEl) : null;
          if (!columnVm) {
            return;
          }
          vm = calboardVm.onAdd(evt.clientY - $scrollEl.offset().top + $scrollEl.scrollTop(), columnVm);
        }
        calboardVm.selectedVm(vm);
      });

      jquery(document).mousemove(function(evt) {
        if (!dragInfo) {
          return;
        }
        var top = evt.clientY - dragInfo.startY - $scrollEl.scrollTop();

        if (dragInfo.resize) {
          var height = dragInfo.startHeight + (top - dragInfo.startTop);
          height = Math.min(height, calboardVm.totalHeight - dragInfo.startTop - calboardVm.rowHeight);
          height = Math.max(height, calboardVm.rowHeight);
          dragInfo.vm.height(height);
        } else {
          // top = Math.min(top, calboardVm.totalHeight - dragInfo.startHeight); // - calboardVm.rowHeight);
          top = Math.min(top, calboardVm.totalHeight - dragInfo.startHeight - calboardVm.rowHeight);
          top = Math.max(top, 0);
          // try to find ColumnID
          dragInfo.moveEl.hide();
          var colID = findColumnIDAtPoint(evt.pageX, evt.pageY);
          dragInfo.moveEl.show();
          if (colID) {
            dragInfo.colID = colID;
          }
          // indirectly set position
          dragInfo.vm.position({
            top: top,
            // left: left,
            ColumnID: dragInfo.colID,
          });
        }
      });
    }
  };

  function findColumnIDAtPoint(x, y) {
    var colID;
    var hiddenEls = [];

    var maxLevels = 2;
    while (maxLevels--) {
      // get the element under the cursor
      var el = jquery(document.elementFromPoint(x, y));
      // test to see if it is a `column`
      if (el.hasClass("column")) {
        // get the id
        var columnVm = ko.dataFor(el[0]);
        if (columnVm) {
          colID = columnVm.ID;
        }
        break;
      } else {
        // hide the element so we can test again
        el.hide();
        hiddenEls.push(el);
      }
    }

    // re-show hidden elements
    hiddenEls.forEach(function(el) {
      el.show();
    });

    return colID;
  }

  return CalBoard;
});
