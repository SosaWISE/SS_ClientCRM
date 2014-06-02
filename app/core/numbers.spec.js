/*global describe,it,expect*/
define('src/core/numbers.spec', [
  'src/core/numbers'
], function(
  numbers
) {
  "use strict";

  describe('numbers:', function() {

    it('should have `roundTo` function', function() {
      expect(typeof(numbers.roundTo)).toBe('function');
    });

    describe('roundTo', function() {
      it('should round positive numbers correctly', function() {
        expect(numbers.roundTo(123.5678, 3)).toBe(123.568);
        expect(numbers.roundTo(123.5678, 0)).toBe(124);
      });
      it('should round negative numbers correctly', function() {
        expect(numbers.roundTo(-123.5678, 3)).toBe(-123.568);
        expect(numbers.roundTo(-123.5678, 0)).toBe(-124);
      });

      it('should round 10.2 correctly', function() {
        // this is a regression test for a bug
        // that converted 10.2 to 10.19999
        expect(numbers.roundTo(10.2, 5)).toNotBe(10.19999);
        expect(numbers.roundTo(10.2, 5)).toBe(10.2);
      });
    });

  });
});
