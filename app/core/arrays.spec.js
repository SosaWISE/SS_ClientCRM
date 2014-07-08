/* global describe, it, expect */
define('src/core/arrays.spec', [
  'src/core/arrays'
], function(arrays) {
  "use strict";

  describe('arrays', function() {
    // var vm;
    // beforeEach(function() {});

    it('should have an `insertOrdered` property', function() {
      expect(typeof arrays.insertOrdered).toBe('function');
    });

    it('`insertOrdered` should insert in correct order', function() {
      var list = [2, 4, 6, 8],
        comparer = function(a, b) {
          return a - b;
        };
      // insert
      arrays.insertOrdered(list, comparer, 5);
      expect(list).toEqual([2, 4, 5, 6, 8]);
      // end
      arrays.insertOrdered(list, comparer, 9);
      expect(list).toEqual([2, 4, 5, 6, 8, 9]);
      // start
      arrays.insertOrdered(list, comparer, 1);
      expect(list).toEqual([1, 2, 4, 5, 6, 8, 9]);
    });
  });
});
