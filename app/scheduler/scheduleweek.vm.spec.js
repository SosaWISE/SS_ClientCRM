/* global describe, it, expect, beforeEach */
define("src/scheduler/scheduleweek.vm.spec", [
  "src/scheduler/scheduleweek.vm"
], function(
  ScheduleWeekViewModel
) {
  "use strict";

  describe("scheduleweek.vm", function() {
    // var vm;
    beforeEach(function() {
      // vm = new ScheduleWeekViewModel({
      //   layersVm: true, //@HACK:
      //   startHour: 6,
      //   endHour: 24,
      // });
    });

    it("should NOT have a static `timeToRow` function", function() {
      expect(ScheduleWeekViewModel.timeToRow).toBeUndefined();
    });
  });
});
