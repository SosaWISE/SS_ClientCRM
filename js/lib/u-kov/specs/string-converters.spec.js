/*global describe,it,expect*/
define([
 'string-converters'
], function(
  converters
) {
  "use strict";

  describe('String Converters:', function() {

    describe('string converter', function() {
      var converter = converters.string();

      it('should trim', function() {
        expect(converter('  b  ')).toBe('b');
      });
      it('should be empty string for falsy values', function() {
        expect(converter(null)).toBe('');
      });
    });

    describe('bool converter', function() {
      var converter = converters.bool();

      it('should be true if \'true\' or \'1\'', function() {
        expect(converter('true')).toBe(true);
        expect(converter('1')).toBe(true);
      });
      it('should be false for other values', function() {
        expect(converter('false')).toBe(false);
        expect(converter('0')).toBe(false);
        expect(converter('asdf')).toBe(false);
        expect(converter('')).toBe(false);
      });
    });

    describe('number converter', function() {
      var precision3Converter = converters.number(3),
        precision0Converter = converters.number(0),
        precision5Converter = converters.number(5);

      it('should correctly convert number string to number', function() {
        expect(precision3Converter('123.12345')).toBe(123.123);
        expect(precision0Converter('123.12345')).toBe(123);
      });
      it('should round positive numbers correctly', function() {
        expect(precision3Converter('123.5678')).toBe(123.568);
        expect(precision0Converter('123.5678')).toBe(124);
      });
      it('should round negative numbers correctly', function() {
        expect(precision3Converter('-123.5678')).toBe(-123.568);
        expect(precision0Converter('-123.5678')).toBe(-124);
      });
      it('should return undefined for falsy values', function() {
        expect(precision3Converter('')).toBeUndefined();
      });
      it('should return Error for invalid numbers', function() {
        expect(precision3Converter('a-123.5678') instanceof Error).toBe(true);
        expect(precision3Converter(' ') instanceof Error).toBe(true);
      });
      it('should return Error for invalid numbers, including values that parseFloat can parse part of', function() {
        expect(precision3Converter('-12b3.5678') instanceof Error).toBe(true);
        expect(precision0Converter('-12b3.5678') instanceof Error).toBe(true);
      });
      it('should ignore leading zeros', function() {
        expect(precision3Converter('0000123.5678')).toBe(123.568);
        expect(precision0Converter('0000123.5678')).toBe(124);
      });

      it('should round 10.2 correctly', function() {
        // this is a regression test for a bug
        // that converted 10.2 to 10.19999
        expect(precision5Converter('10.2')).toNotBe(10.19999);
        expect(precision5Converter('10.2')).toBe(10.2);
      });
    });
  });
});
