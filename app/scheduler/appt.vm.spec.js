/* global describe, it, expect, beforeEach */
define("src/scheduler/appt.vm.spec", [
  "src/scheduler/appt.vm"
], function(
  ApptViewModel
) {
  "use strict";

  describe("appt.vm", function() {
    var timeToRow = ApptViewModel.timeToRow;
    var rowToTicks = ApptViewModel.rowToTicks;
    var startHour;
    // var vm;
    beforeEach(function() {
      startHour = 6;
      // vm = new ApptViewModel({
      //   item: {},
      //   startHour: 6,
      //   endHour: 24,
      // });
    });

    it("should have a static `timeToRow` function", function() {
      expect(typeof timeToRow).toBe("function");
    });
    it("should have a static `rowToTicks` function", function() {
      expect(typeof rowToTicks).toBe("function");
    });

    describe("timeToRow", function() {
      it("null date should return first row", function() {
        expect(timeToRow(startHour, null)).toBe(0);
      });
      it("if `endHour` is passed, a null date should return the last row", function() {
        var endHour = 24;
        expect(timeToRow(startHour, null, endHour)).toBe(216);
      });
      it("should snap rows to 5 minute increments", function() {
        var rowOffset = 12;
        //
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 0, 0, 0))).toBe(rowOffset + 0);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 1, 0, 0))).toBe(rowOffset + 0);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 2, 0, 0))).toBe(rowOffset + 0);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 3, 0, 0))).toBe(rowOffset + 0);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 4, 0, 0))).toBe(rowOffset + 0);
        //
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 5, 0, 0))).toBe(rowOffset + 1);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 6, 0, 0))).toBe(rowOffset + 1);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 7, 0, 0))).toBe(rowOffset + 1);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 8, 0, 0))).toBe(rowOffset + 1);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 9, 0, 0))).toBe(rowOffset + 1);
        //
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 10, 0, 0))).toBe(rowOffset + 2);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 11, 0, 0))).toBe(rowOffset + 2);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 12, 0, 0))).toBe(rowOffset + 2);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 13, 0, 0))).toBe(rowOffset + 2);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 14, 0, 0))).toBe(rowOffset + 2);
        //
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 15, 0, 0))).toBe(rowOffset + 3);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 16, 0, 0))).toBe(rowOffset + 3);
        //
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 20, 0, 0))).toBe(rowOffset + 4);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 25, 0, 0))).toBe(rowOffset + 5);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 30, 0, 0))).toBe(rowOffset + 6);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 35, 0, 0))).toBe(rowOffset + 7);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 40, 0, 0))).toBe(rowOffset + 8);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 45, 0, 0))).toBe(rowOffset + 9);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 50, 0, 0))).toBe(rowOffset + 10);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 7, 55, 0, 0))).toBe(rowOffset + 11);
        expect(timeToRow(startHour, new Date(2000, 1, 1, 8, 0, 0, 0))).toBe(rowOffset + 12);
      });
    });

    describe("rowToTicks", function() {
      // it("null date should return first row", function() {
      //   expect(rowToTicks(startHour, null)).toBe(0);
      // });
      // it("if `endHour` is passed, a null date should return the last row", function() {
      //   var endHour = 24;
      //   expect(rowToTicks(startHour, null, endHour)).toBe(216);
      // });
      it("should snap rows to 5 minute increments", function() {
        var rowOffset = 12;
        //
        expect(rowToTicks(startHour, rowOffset + 0)).toBe(25200000);
        //
        expect(rowToTicks(startHour, rowOffset + 1)).toBe(25500000);
        //
        expect(rowToTicks(startHour, rowOffset + 2)).toBe(25800000);
        //
        expect(rowToTicks(startHour, rowOffset + 3)).toBe(26100000);
        //
        expect(rowToTicks(startHour, rowOffset + 4)).toBe(26400000);
        expect(rowToTicks(startHour, rowOffset + 5)).toBe(26700000);
        expect(rowToTicks(startHour, rowOffset + 6)).toBe(27000000);
        expect(rowToTicks(startHour, rowOffset + 7)).toBe(27300000);
        expect(rowToTicks(startHour, rowOffset + 8)).toBe(27600000);
        expect(rowToTicks(startHour, rowOffset + 9)).toBe(27900000);
        expect(rowToTicks(startHour, rowOffset + 10)).toBe(28200000);
        expect(rowToTicks(startHour, rowOffset + 11)).toBe(28500000);
        expect(rowToTicks(startHour, rowOffset + 12)).toBe(28800000);
      });
    });
  });
});
