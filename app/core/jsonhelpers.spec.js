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
      describe('should replace dates with the number of milliseconds since 1 January 1970 (unix offset) when the key', function() {
        it('ends with `On`', function() {
          expect(jsonhelpers.stringify({
            bob: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)), // doesn't get converted to a unix offset
            bobOn: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          })).toBe('{"bob":"2000-06-10T09:08:07.006Z","bobOn":960628087006}');
        });
        it('starts with `Date`', function() {
          expect(jsonhelpers.stringify({
            DateBob: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          })).toBe('{"DateBob":960628087006}');
        });
        it('ends with `Date`', function() {
          expect(jsonhelpers.stringify({
            bobDate: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          })).toBe('{"bobDate":960628087006}');
        });
        it('ends with `DateTime`', function() {
          expect(jsonhelpers.stringify({
            bobDateTime: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          })).toBe('{"bobDateTime":960628087006}');
        });
        it('equals `DOB`', function() {
          expect(jsonhelpers.stringify({
            DOB: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          })).toBe('{"DOB":960628087006}');
        });
      });

      describe('when name ends with Json', function() {
        it('should replace the javascript object with a JSON string', function() {
          expect(jsonhelpers.stringify({
            bobJson: {
              id: 1,
              name: "bob",
              bobOn: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
            },
          })).toBe('{"bobJson":"{\\"id\\":1,\\"name\\":\\"bob\\",\\"bobOn\\":960628087006}"}');
        });
      });
    });
    describe('reviver', function() {
      describe('should replace the number of milliseconds since 1 January 1970 (unix offset) with dates when the key', function() {
        it('ends with `On`', function() {
          expect(jsonhelpers.parse('{"bob":"2000-06-10T09:08:07.006Z","bobOn":960628087006}')).toEqual({
            bob: "2000-06-10T09:08:07.006Z", // doesn't get converted back to a date
            bobOn: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          });
        });
        it('starts with `Date`', function() {
          expect(jsonhelpers.parse('{"DateBob":960628087006}')).toEqual({
            DateBob: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          });
        });
        it('ends with `DateTime`', function() {
          expect(jsonhelpers.parse('{"bobDateTime":960628087006}')).toEqual({
            bobDateTime: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          });
        });
        it('equals `DOB`', function() {
          expect(jsonhelpers.parse('{"DOB":960628087006}')).toEqual({
            DOB: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
          });
        });
      });

      it('should replace datetime string with date', function() {
        expect(jsonhelpers.parse('{"bobOn":"2000-06-10T09:08:07.006Z"}')).toEqual({
          bobOn: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
        });
      });

      describe('when name ends with Json', function() {
        it('should replace JSON string with a javascript object', function() {
          expect(jsonhelpers.parse('{"bobJson":"{\\"id\\":1,\\"name\\":\\"bob\\",\\"bobOn\\":960628087006}"}')).toEqual({
            bobJson: {
              id: 1,
              name: "bob",
              bobOn: new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6)),
            },
          });
        });
      });
    });

  });
});
