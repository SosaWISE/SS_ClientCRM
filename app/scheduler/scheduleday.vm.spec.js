/* global describe, it, expect, beforeEach */
define("src/scheduler/scheduleday.vm.spec", [
  "src/scheduler/scheduleday.vm"
], function(
  ScheduleDayViewModel
) {
  "use strict";

  describe("scheduleday.vm", function() {
    // var vm;
    beforeEach(function() {
      // vm = new ScheduleDayViewModel({
      //   layersVm: true, //@HACK:
      //   startHour: 6,
      //   endHour: 24,
      // });
    });

    it("should NOT have a static `timeToRow` function", function() {
      expect(ScheduleDayViewModel.timeToRow).toBeUndefined();
    });
  });
});
