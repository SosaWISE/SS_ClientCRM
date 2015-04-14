/*global describe,it,expect*/
define("src/core/numbers.spec", [
  "src/core/numbers"
], function(
  numbers
) {
  "use strict";

  describe("numbers:", function() {

    it("should have `roundTo` function", function() {
      expect(typeof(numbers.roundTo)).toBe("function");
    });
    it("should have `toOrdinal` function", function() {
      expect(typeof(numbers.toOrdinal)).toBe("function");
    });

    describe("roundTo", function() {
      it("should round positive numbers correctly", function() {
        expect(numbers.roundTo(123.5678, 3)).toBe(123.568);
        expect(numbers.roundTo(123.5678, 0)).toBe(124);
      });
      it("should round negative numbers correctly", function() {
        expect(numbers.roundTo(-123.5678, 3)).toBe(-123.568);
        expect(numbers.roundTo(-123.5678, 0)).toBe(-124);
      });

      it("should round 10.2 correctly", function() {
        // this is a regression test for a bug
        // that converted 10.2 to 10.19999
        expect(numbers.roundTo(10.2, 5)).toNotBe(10.19999);
        expect(numbers.roundTo(10.2, 5)).toBe(10.2);
      });
    });

    describe("toOrdinal", function() {
      it("should convert a number to an ordinal number", function() {
        [
          [1, "1st"],
          [2, "2nd"],
          [3, "3rd"],
          [4, "4th"],
          [5, "5th"],
          [6, "6th"],
          [7, "7th"],
          [8, "8th"],
          [9, "9th"],
          [10, "10th"],
          [11, "11th"],
          [12, "12th"],
          [13, "13th"],
          [14, "14th"],
          [15, "15th"],
          [16, "16th"],
          [17, "17th"],
          [18, "18th"],
          [19, "19th"],
          [20, "20th"],
          [21, "21st"],
          [22, "22nd"],
          [23, "23rd"],
          [24, "24th"],
          [25, "25th"],
          // ...
          [101, "101st"],
          [102, "102nd"],
          [103, "103rd"],
          [104, "104th"],
          // ...
          [111, "111th"],
          [112, "112th"],
          [113, "113th"],
          // ...
          [121, "121st"],
          [122, "122nd"],
          [123, "123rd"],
          [124, "124th"],
          // ...
          [1111, "1111th"],
          [1112, "1112th"],
          [1113, "1113th"],
          // ...
          [1121, "1121st"],
          [1122, "1122nd"],
          [1123, "1123rd"],
          [1124, "1124th"],
        ].forEach(function(ray) {
          var num = ray[0],
            expected = ray[1];
          expect(numbers.toOrdinal(num)).toBe(expected);
        });
      });
    });

  });
});
