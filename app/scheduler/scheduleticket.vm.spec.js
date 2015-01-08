/* global describe, it, expect, beforeEach */
define("src/scheduler/scheduleticket.vm.spec", [
  "src/scheduler/scheduleticket.vm"
], function(
  ScheduleDayViewModel
) {
  "use strict";

  describe("scheduleticket.vm", function() {
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
