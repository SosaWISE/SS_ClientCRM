/*global describe,it,expect*/
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
      var tenAndOlder = validators.minAge('MM/DD/YYYY HH:mm', false, 10);

      it('should return falsey value when valid', function() {
        expect(tenAndOlder('1/11/2000 1:00')).toBeUndefined();
        expect(tenAndOlder('6/15/2000 9:30')).toBeUndefined();
        expect(tenAndOlder('6/15/2000 9:31')).toBeUndefined();
      });
      it('should return truthy value when invalid', function() {
        expect(tenAndOlder('1/11/2001 1:00')).toBeDefined();
        expect(tenAndOlder('6/16/2000 1:00')).toBeDefined();
      });
    });
  });
});
