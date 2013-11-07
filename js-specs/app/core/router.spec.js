define('spec/app/core/router.spec', [
  'src/core/router'
], function(router) {
  "use strict";

  describe('router', function() {
    // var vm;
    // beforeEach(function() {});

    it('should have an `create` property', function() {
      expect(router.create).toBeDefined();
      expect(typeof router.create).toBe('function');
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
    // describe('redirectTo', function() {
    //   it('should ', function() {
    //     expect(true).toBe(true);
    //   });
    // });
  });
});
