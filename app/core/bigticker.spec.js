/* global describe, it, expect, jasmine, beforeEach */
define("src/core/bigticker.spec", [
  "src/core/bigticker",
], function(bigticker) {
  "use strict";

  describe("bigticker", function() {
    describe("setTimeout", function() {
      var bt;
      beforeEach(function() {
        bt = bigticker.create();
      });

      it("should return a number", function() {
        var id = bt.setTimeout(function() {}, 0);
        expect(typeof id).toBe("number");
        expect(id).toBeGreaterThan(0);
      });
      it("should call callback after designated time", function() {
        jasmine.Clock.useMock();

        var callCount = 0;
        bt.setTimeout(function() {
          callCount++;
        }, 0);

        jasmine.Clock.tick(0);
        expect(callCount).toBe(1);
      });
      it("should pass arguments to callback", function() {
        jasmine.Clock.useMock();

        var callCount = 0;
        bt.setTimeout(function(a, b, c) {
          expect(a).toBe("a");
          expect(b).toBe("b");
          expect(c).toBe("c");
          callCount++;
        }, 0, "a", "b", "c");

        jasmine.Clock.tick(0);
        expect(callCount).toBe(1);
      });

      describe("when paused", function() {
        it("should pause new timers", function() {
          jasmine.Clock.useMock();

          bt.pause();

          var callCount = 0;
          bt.setTimeout(function() {
            callCount++;
          }, 0);

          jasmine.Clock.tick(0);
          expect(callCount).toBe(0);
        });
      });
    });

    describe("clearTimeout", function() {
      var bt;
      beforeEach(function() {
        bt = bigticker.create();
      });

      it("should clear the timer", function() {
        jasmine.Clock.useMock();

        var callCount = 0;
        var id = bt.setTimeout(function() {
          callCount++;
        }, 0);
        bt.clearTimeout(id);

        jasmine.Clock.tick(100);
        expect(callCount).toBe(0);
      });

      it("should work during pause", function() {
        jasmine.Clock.useMock();

        var callCount = 0;
        var id = bt.setTimeout(function() {
          callCount++;
        }, 0);
        bt.pause();
        bt.clearTimeout(id);
        bt.restart();

        jasmine.Clock.tick(100);
        expect(callCount).toBe(0);
      });

      it("should work after pause and restart", function() {
        jasmine.Clock.useMock();

        var callCount = 0;
        var id = bt.setTimeout(function() {
          callCount++;
        }, 0);
        bt.pause();
        bt.restart();
        bt.clearTimeout(id);

        jasmine.Clock.tick(100);
        expect(callCount).toBe(0);
      });
    });

    describe("pause", function() {
      var bt;
      beforeEach(function() {
        bt = bigticker.create();
      });

      it("should clear all timers", function() {
        jasmine.Clock.useMock();

        var callCount = 0;
        bt.setTimeout(function() {
          callCount++;
        }, 0);
        bt.setTimeout(function() {
          callCount++;
        }, 200);

        bt.pause();
        expect(countZeroIds(bt._timeoutMap)).toBe(2);

        jasmine.Clock.tick(500);
        expect(callCount).toBe(0);
      });
    });

    describe("restart", function() {
      var bt;
      beforeEach(function() {
        bt = bigticker.create();
      });

      it("should restart all stopped timers", function() {
        jasmine.Clock.useMock();

        var callCount = 0;
        bt.setTimeout(function() {
          callCount++;
        }, 0);
        bt.setTimeout(function() {
          callCount++;
        }, 200);

        bt.pause();
        expect(countZeroIds(bt._timeoutMap)).toBe(2);
        bt.restart();
        expect(countZeroIds(bt._timeoutMap)).toBe(0);

        jasmine.Clock.tick(100);
        expect(callCount).toBe(1);

        jasmine.Clock.tick(100);
        expect(callCount).toBe(2);
      });
    });
  });

  function countZeroIds(timeoutMap) {
    var count = 0;
    Object.keys(timeoutMap).forEach(function(btid) {
      if (timeoutMap[btid].id === 0) {
        count++;
      }
    });
    return count;
  }
});
