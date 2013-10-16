(function() {
  'use strict';

  define('1circularA', ['1circularB'], function(b) {
    return 'A' + b;
  });
  define('1circularB', ['1circularA'], function(a) {
    return 'B' + a; // 'a' should be undefined
  });

  define('2circularA', ['2circularB'], function(b) {
    return 'A' + b;
  });
  define('2circularB', ['2circularC'], function(c) {
    return 'B' + c;
  });
  define('2circularC', ['2circularD'], function(d) {
    return 'C' + d;
  });
  define('2circularD', ['2circularE'], function(e) {
    return 'D' + e;
  });
  define('2circularE', ['2circularA'], function(a) {
    return 'E' + a; // 'a' should be undefined
  });
})();

define('spec/lib/spec.depends', [
], function() {
  "use strict";

  describe('depends', function() {

    it('define function should be defined', function() {
      expect(typeof(window.define)).toBe('function');
    });
    it('require function should be defined', function() {
      expect(typeof(window.require)).toBe('function');
    });

    describe('cirular dependencies', function() {
      it('should be stopped before they\'re started', function() {
        var a;
        require('1circularA', function(param) {
          a = param;
        });
        waitsFor(function() {
          return a;
        }, 1000);
        runs(function() {
          expect(a).toEqual('ABundefined');
        });
      });
      it('should be stopped at any level', function() {
        var a;
        require('2circularA', function(param) {
          a = param;
        });
        waitsFor(function() {
          return a;
        }, 1000);
        runs(function() {
          expect(a).toEqual('ABCDEundefined');
        });
      });
    });
  });
});
