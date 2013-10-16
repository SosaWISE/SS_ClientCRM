define('spec/app/router/spec.router', [
  'src/router/router'
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
    // describe('goToRoute', function() {
    //   it('should ', function() {
    //     expect(true).toBe(true);
    //   });
    // });
  });
});
