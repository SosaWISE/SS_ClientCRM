/* global describe, it, expect, jasmine */
define('src/core/helpers.spec', [
  'src/core/helpers',
], function(helpers) {
  "use strict";

  describe('helpers', function() {

    it('should have a `onetimer` function', function() {
      expect(typeof helpers.onetimer).toBe('function');
    });

    describe('onetimer', function() {

      it('should call loader function only one time', function() {
        var callCount = 0,
          once = helpers.onetimer(function() {
            callCount++;
          });

        expect(callCount).toBe(0);
        once();
        expect(callCount).toBe(1);
        once();
        once();
        expect(callCount).toBe(1);
      });
      it('should call all callbacks one time after loader function is complete', function() {
        jasmine.Clock.useMock();

        var callOrder = '',
          once = helpers.onetimer(function(cb) {
            window.setTimeout(cb, 1000);
          });

        once(function() {
          callOrder += 'a';
        });
        once(function() {
          callOrder += 'b';
        });
        once(function() {
          callOrder += 'c';
        });

        expect(callOrder).toBe('');
        jasmine.Clock.tick(1000);
        expect(callOrder).toBe('abc');

        // this one will be synchronously
        once(function() {
          callOrder += 'd';
        });
        expect(callOrder).toBe('abcd');
      });
    });
  });
});
