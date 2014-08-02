/* global describe, it, expect */
define('src/core/router.spec', [
  'src/core/router'
], function(Router) {
  "use strict";

  describe('Router', function() {
    // var vm;
    // beforeEach(function() {});

    it('should be a function', function() {
      expect(typeof Router).toBe('function');
    });

    // describe('addRoute', function() {
    //   it('should ', function() {
    //     expect(true).toBe(true);
    //   });
    // });
    //
    // describe('goToPath', function() {
    //   it('should ', function() {
    //     expect(true).toBe(true);
    //   });
    // });
    // describe('goTo', function() {
    //   it('should ', function() {
    //     expect(true).toBe(true);
    //   });
    // });
  });
});
