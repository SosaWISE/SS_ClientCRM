/*global describe,it,expect,beforeEach*/
define("src/u-kov/string-converters.spec", [
  "src/u-kov/string-converters"
], function(
  converters
) {
  "use strict";

  describe("String Converters:", function() {
    beforeEach(function() {
      this.addMatchers({
        toBeDate: function(expected) {
          if (this.actual instanceof Date && expected instanceof Date) {
            return this.actual.valueOf() === expected.valueOf();
          } else {
            return false;
          }
        },
      });
    });

    describe("string converter", function() {
      var converter = converters.string();

      it("should trim", function() {
        expect(converter("  b  ")).toBe("b");
      });
      it("should be null for non empty string falsy values", function() {
        expect(converter(null)).toBe(null);
        expect(converter()).toBe(null);
        expect(converter("")).toBe("");
      });
    });

    describe("bool converter", function() {
      var converter = converters.bool();

      it("should be true if 'true' or '1'", function() {
        expect(converter("true")).toBe(true);
        expect(converter("1")).toBe(true);
      });
      it("should be false for other values", function() {
        expect(converter("false")).toBe(false);
        expect(converter("0")).toBe(false);
        expect(converter("asdf")).toBe(false);
        expect(converter("")).toBe(false);
      });
    });

    describe("number converter", function() {
      var precision3Converter = converters.number(3),
        precision0Converter = converters.number(0),
        precision5Converter = converters.number(5);

      it("should correctly convert number string to number", function() {
        expect(precision3Converter("123.12345")).toBe(123.123);
        expect(precision0Converter("123.12345")).toBe(123);
      });
      it("should round positive numbers correctly", function() {
        expect(precision3Converter("123.5678")).toBe(123.568);
        expect(precision0Converter("123.5678")).toBe(124);
      });
      it("should round negative numbers correctly", function() {
        expect(precision3Converter("-123.5678")).toBe(-123.568);
        expect(precision0Converter("-123.5678")).toBe(-124);
      });
      it("should return null for falsy values", function() {
        expect(precision3Converter("")).toBe(null);
      });
      it("should remove invalid characters", function() {
        expect(precision3Converter("a-123.56b78")).toBe(-123.568);
        expect(precision3Converter("-12b3.5678")).toBe(-123.568);
        expect(precision3Converter("    -12 b3.56 78   ")).toBe(-123.568);
      });
      it("should return Error when there's not a number", function() {
        expect(precision3Converter(" ") instanceof Error).toBe(true);
      });
      it("should return Error when - and . characters are in wrong positions", function() {
        expect(precision3Converter("-123.56.78") instanceof Error).toBe(true);
        expect(precision3Converter("-123.56-78") instanceof Error).toBe(true);
      });
      it("should ignore leading zeros", function() {
        expect(precision3Converter("0000123.5678")).toBe(123.568);
        expect(precision0Converter("0000123.5678")).toBe(124);
      });

      it("should round 10.2 correctly", function() {
        // this is a regression test for a bug
        // that converted 10.2 to 10.19999
        expect(precision5Converter("10.2")).toNotBe(10.19999);
        expect(precision5Converter("10.2")).toBe(10.2);
      });
    });

    describe("phone converter", function() {
      var converter = converters.phone();

      it("should always return expected output when valid", function() {
        // var expected = "(123) 123-1234";
        var expected = "1231231234"; // convert to raw digits
        expect(converter("1231231234")).toBe(expected);
        expect(converter("(123)123-1234")).toBe(expected);
        expect(converter("123.123.1234")).toBe(expected);
      });
      it("should return Error when invalid", function() {
        expect(converter("123123123") instanceof Error).toBe(true);
        expect(converter("(23)123-1234") instanceof Error).toBe(true);
        expect(converter("123.23.1234") instanceof Error).toBe(true);
        expect(converter("asdf") instanceof Error).toBe(true);
      });
    });

    describe("date converter", function() {
      var converter = converters.date();

      it("should always return expected output when valid", function() {
        var expected = new Date(Date.UTC(1982, 8, 4));
        expect(converter("09/04/1982")).toBeDate(expected);
        expect(converter("9/4/1982")).toBeDate(expected);
        expect(converter("sep 4 1982")).toBeDate(expected);
        expect(converter("Sep 4 1982")).toBeDate(expected);
        expect(converter("4 sep 1982")).toBeDate(expected);
        expect(converter("4 Sep 1982")).toBeDate(expected);
      });
      it("should use 2000's when 49 and below is entered", function() {
        expect(converter("Sep 4 49")).toBeDate(new Date(Date.UTC(2049, 8, 4)));
        expect(converter("Sep 4 0")).toBeDate(new Date(Date.UTC(2000, 8, 4)));
      });
      it("should use 1900's when year 50 and up is entered", function() {
        expect(converter("Sep 4 50")).toBeDate(new Date(Date.UTC(1950, 8, 4)));
        expect(converter("Sep 4 99")).toBeDate(new Date(Date.UTC(1999, 8, 4)));
      });

      it("should return Error when invalid", function() {
        expect(converter("Sep 4 100") instanceof Error).toBe(true);
        expect(converter("4 Frog 1982") instanceof Error).toBe(true);
        expect(converter("4 1982") instanceof Error).toBe(true);
      });
      it("should return Error when no day is specified", function() {
        expect(converter("Sep 1982") instanceof Error).toBe(true);
      });
    });

    describe("datetime converter", function() {
      var converter = converters.datetime();

      it("should always return expected output when valid", function() {
        var expected = new Date(1982, 8, 4, 11, 10, 9, 8);
        expect(converter("09/04/1982 11:10:09.008 am")).toBeDate(expected);
        expect(converter("9/4/1982 11:10:09.008 am")).toBeDate(expected);
        expect(converter("9/4/1982 11:10:09 am")).toBeDate(new Date(1982, 8, 4, 11, 10, 9));
        expect(converter("9/4/1982 11:10 am")).toBeDate(new Date(1982, 8, 4, 11, 10));
        expect(converter("sep 4 1982 11:10:09.008 am")).toBeDate(expected);
        expect(converter("Sep 4 1982 11:10:09.008 am")).toBeDate(expected);
        expect(converter("4 sep 1982 11:10:09.008 am")).toBeDate(expected);
        expect(converter("4 Sep 1982 11:10:09.008 am")).toBeDate(expected);
        expect(converter("4 Sep 1982")).toBeDate(new Date(1982, 8, 4));
      });
      it("should use 2000's when 49 and below is entered", function() {
        expect(converter("Sep 4 49 11:10 am")).toBeDate(new Date(2049, 8, 4, 11, 10));
        expect(converter("Sep 4 0 11:10 am")).toBeDate(new Date(2000, 8, 4, 11, 10));
      });
      it("should use 1900's when year 50 and up is entered", function() {
        expect(converter("Sep 4 50 11:10 am")).toBeDate(new Date(1950, 8, 4, 11, 10));
        expect(converter("Sep 4 99 11:10 am")).toBeDate(new Date(1999, 8, 4, 11, 10));
      });
      it("should try to correct invalid time", function() {
        expect(converter("09/04/1982 11:b10:09.008 am")).toBeDate(new Date(1982, 8, 4, 11, 10, 9, 8));
      });

      it("should return Error when invalid", function() {
        var errName = Error.name;
        expect(converter("09/04/1982 11:10:09.008").constructor.name).toBe(errName); // missing am/pm
        expect(converter("09/04/1982 11 am").constructor.name).toBe(errName); // missing hours
      });
    });
  });
});
