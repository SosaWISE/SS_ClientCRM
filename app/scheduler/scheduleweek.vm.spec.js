/* global describe, it, expect, beforeEach */
define("src/scheduler/scheduleweek.vm.spec", [
  "src/scheduler/scheduleweek.vm"
], function(
  ScheduleWeekViewModel
) {
  "use strict";

  describe("scheduleweek.vm", function() {
    var timeToRow = ScheduleWeekViewModel.timeToRow;
    var startHour;
    // var vm;
    beforeEach(function() {
      startHour = 6;
      // vm = new ScheduleWeekViewModel({
      //   layersVm: true, //@HACK:
      //   startHour: 6,
      //   endHour: 24,
      // });
    });

    it("should have a static `timeToRow` function", function() {
      expect(typeof timeToRow).toBe("function");
    });

    describe("timeToRow", function() {
      it("null date should return first row", function() {
        expect(timeToRow(startHour, null)).toBe(0);
      });
      it("if `endHour` is passed, a null date should return the last row", function() {
        var endHour = 24;
        expect(timeToRow(startHour, null, endHour)).toBe(72);
      });
      it("should snap rows to 15 minute increments", function() {
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 0, 0, 0))).toBe(4);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 14, 0, 0))).toBe(4);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 15, 0, 0))).toBe(5);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 16, 0, 0))).toBe(5);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 30, 0, 0))).toBe(6);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 45, 0, 0))).toBe(7);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 8, 0, 0, 0))).toBe(8);
      });
    });
  });
});
