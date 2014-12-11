define("src/scheduler/scheduleweek.vm", [
  "src/scheduler/appt.vm",
  "jquery",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ApptViewModel,
  jquery,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var rowHeight = ApptViewModel.rowHeight;
  var halfHourRowHeight = rowHeight * 6;
  // var halfRowHeight = rowHeight / 2;

  //
  // ui bindings
  //
  ko.bindingHandlers.wk = {
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


  // techs on selected day
  var dayTechs = [ //
    {
      name: "Hank",
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
        }, {
          StartTime: new Date(2000, 1, 1, 8, 45, 0, 0),
          EndTime: new Date(2000, 1, 1, 9, 30, 0, 0),
        },
      ],
    }, {
      name: "Frank",
      gones: [ //
        {
          StartTime: null,
          EndTime: new Date(2000, 1, 1, 8, 0, 0, 0),
        },
      ],
    },
  ];
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

    _this.halfHourRows = ko.observableArray([]);
    _this.columns = ko.observableArray([]);

    var i, length, row;
    // number of half hours
    length = (_this.endHour - _this.startHour) * 2;
    for (i = 0; i < length; i++) {
      row = i * 6;
      _this.halfHourRows.push({
        index: i,
        beginsHour: i % 6 === 0,
        position: {
          top: row * rowHeight,
        },
        height: halfHourRowHeight,
      });
    }
    _this.totalHeight = _this.halfHourRows.peek().length * halfHourRowHeight;

    _this.columns(dayTechs.map(function(tech) {
      return {
        tech: tech,
        gones: !tech.gones ? [] : tech.gones.map(function(item) {
          return ApptViewModel.toCalendarItem(false, item, _this.startHour, _this.endHour);
        }),
        appts: !tech.appts ? [] : tech.appts.map(function(item) {
          return ApptViewModel.toCalendarItem(true, item, _this.startHour, _this.endHour);
          // return new ApptViewModel({
          //   item: item,
          //   parent: _this,
          // });
        }),
      };
    }));
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


    _this.editorVm = ko.observable();

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
