/*global describe,it,expect,beforeEach*/
define('src/u-kov/validators.spec', [
  'src/u-kov/validators',
  'moment',
], function(
  validators,
  moment
) {
  "use strict";

  describe('Ukov Validators:', function() {
    // overwrite now function
    validators.now = function(isLocal) {
      if (isLocal) {
        return moment('6/15/2010 9:30', 'MM/DD/YYYY HH:mm');
      } else {
        return moment.utc('6/15/2010 9:30', 'MM/DD/YYYY HH:mm');
      }
    };

    describe('minAge', function() {
      var tenAndOlder;
      beforeEach(function() {
        tenAndOlder = validators.minAge(false, 10);
      });

      describe('when valid', function() {
        it('should return falsey value', function() {
          expect(tenAndOlder(moment('1/11/2000 1:00').toDate())).toBeFalsy();
          expect(tenAndOlder(moment('6/15/2000 9:29').toDate())).toBeFalsy();
          expect(tenAndOlder(moment('6/15/2000 9:30').toDate())).toBeFalsy();
          expect(tenAndOlder(moment('6/15/2000 9:31').toDate())).toBeFalsy();
        });
      });
      describe('when invalid', function() {
        it('should return truthy value', function() {
          expect(tenAndOlder(moment('1/11/2001 1:00').toDate())).toBeTruthy();
          expect(tenAndOlder(moment('6/16/2000 1:00').toDate())).toBeTruthy();
        });
      });
      describe('when invalid input', function() {
        it('should return an error', function() {
          expect(tenAndOlder('1/11/2001 1:00') instanceof Error).toBe(true);
        });
      });
    });

    describe('isRequired', function() {
      var isRequired;
      beforeEach(function() {
        isRequired = validators.isRequired();
      });

      describe('when valid', function() {
        it('should return err msg', function() {
          expect(isRequired()).toBeDefined();
          expect(isRequired(null)).toBeDefined();
        });
      });
      describe('when invalid', function() {
        it('should return truthy value', function() {
          expect(isRequired('bob')).toBeUndefined();
          expect(isRequired(true)).toBeUndefined();
          expect(isRequired(0)).toBeUndefined();
          expect(isRequired(false)).toBeUndefined();
        });
      });
    });
  });
});
