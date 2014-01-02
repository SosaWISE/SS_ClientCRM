/* global describe, it, expect */
define('src/core/jsonhelpers.spec', [
  'src/core/jsonhelpers'
], function(jsonhelpers) {
  "use strict";

  describe('jsonhelpers', function() {
    // var vm;
    // beforeEach(function() {});

    it('should have an `replacer` function', function() {
      expect(typeof jsonhelpers.replacer).toBe('function');
    });
    it('should have an `reviver` function', function() {
      expect(typeof jsonhelpers.reviver).toBe('function');
    });

    describe('replacer', function() {
      it('should replace dates with the number of milliseconds since 1 January 1970 (unix offset) when the key ends with `On`', function() {
        expect(JSON.stringify({
          bob: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)), // doesn't get converted to a unix offset
          bobOn: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
        }, jsonhelpers.replacer)).toBe('{"bob":"2000-06-10T09:08:07.006Z","bobOn":960628087006}');
      });
    });
    describe('reviver', function() {
      it('should replace the number of milliseconds since 1 January 1970 (unix offset) with dates when the key ends with `On`', function() {
        expect(JSON.parse('{"bob":"2000-06-10T09:08:07.006Z","bobOn":960628087006}', jsonhelpers.reviver)).toEqual({
          bob: "2000-06-10T09:08:07.006Z", // doesn't get converted back to a date
          bobOn: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
        });
      });
    });

  });
});
