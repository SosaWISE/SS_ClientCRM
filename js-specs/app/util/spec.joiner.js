define([
  'util/joiner'
], function(joiner) {
  "use strict";

  describe('joiner', function() {

    it('should be a function', function() {
      expect(typeof(joiner)).toBe('function');
    });

    describe('instance', function() {
      var join;
      beforeEach(function() {
        join = joiner();
      });

      it('should have an `add` function that returns a function', function() {
        expect(join.add).toBeDefined();
        expect(typeof(join.add)).toBe('function');
        expect(typeof(join.add())).toBe('function');
      });
      it('should have a `when` function', function() {
        expect(join.when).toBeDefined();
        expect(typeof(join.when)).toBe('function');
      });
    });

    describe('when', function() {
      var join;
      beforeEach(function() {
        join = joiner();
      });

      it('should be called immediately if no adds have been created', function() {
        var called = false;
        join.when(function() {
          called = true;
        });
        expect(called).toBe(true);
      });

      it('should be called when all adds have been called', function() {
        var add1 = join.add(),
          add2 = join.add(),
          called = false;

        join.when(function() {
          called = true;
        });

        expect(called).toBe(false);

        add1();
        expect(called).toBe(false);

        add2();
        expect(called).toBe(true);
      });

      it('should be called with an array of callback results in order of add creation', function() {
        var add1 = join.add(),
          add2 = join.add(),
          callbackResults;

        join.when(function(results) {
          callbackResults = results;
        });

        add2(2);
        add1(1);
        expect(callbackResults).toEqual([1, 2]);
      });

      it('should be called with an array of callback result array if more than one argument was passed to add', function() {
        var add1 = join.add(),
          add2 = join.add(),
          add3 = join.add(),
          callbackResults;

        join.when(function(results) {
          callbackResults = results;
        });

        add2(2, 2);
        add1(1);
        add3([3]);
        expect(callbackResults).toEqual([1, [2, 2], [3]]);
      });

      it('calling add after when should throw an exception', function() {
        // ensure scope without using bind

        function add() {
          return join.add();
        }

        join.when(function() {});
        expect(add).toThrow();
      });
    });
  });
});
