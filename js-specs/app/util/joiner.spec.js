define('spec/app/util/joiner.spec', [
  'src/util/joiner'
], function(joiner) {
  "use strict";

  describe('joiner', function() {
    var join;
    beforeEach(function() {
      join = joiner();
    });

    it('should be a function', function() {
      expect(typeof(joiner)).toBe('function');
    });

    describe('instance', function() {
      it('should have an `add` function that returns a function', function() {
        expect(typeof(join.add)).toBe('function');
        expect(typeof(join.add())).toBe('function');
      });
      it('should have a `when` function', function() {
        expect(typeof(join.when)).toBe('function');
      });
      it('should have a `create` function', function() {
        expect(typeof(join.create)).toBe('function');
      });
    });

    describe('`when`', function() {
      it('should be called immediately if no `add` callbacks have been created', function() {
        var called = false;
        join.when(function() {
          called = true;
        });
        expect(called).toBe(true);
      });

      it('should be called when all `add` callbacks have been called', function() {
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

      it('should be called with an array of callback results in order of `add` creation', function() {
        var add1 = join.add(),
          add2 = join.add(),
          callbackResults;

        join.when(function(err, results) {
          callbackResults = results;
        });

        add2(null, 2);
        add1(null, 1);
        expect(callbackResults).toEqual([1, 2]);
      });

      it('should be called with an array of callback result array if more than one argument was passed to `add`', function() {
        var add1 = join.add(),
          add2 = join.add(),
          add3 = join.add(),
          callbackResults;

        join.when(function(err, results) {
          callbackResults = results;
        });

        add2(null, 2, 2);
        add1(null, 1);
        add3(null, [3]);
        expect(callbackResults).toEqual([1, [2, 2], [3]]);
      });

      it('callbacks should be called only one time', function() {
        var count = 0;
        join.when(function() {
          count++;
        });
        expect(count).toBe(1);
        join.when(function() {});
        expect(count).toBe(1);
      });

      it('calling `add` after when should work as normal', function() {
        var add1, add2,
          called = false;

        add1 = join.add();

        join.when(function() {
          called = true;
        });

        expect(called).toBe(false);

        add2 = join.add();

        add1();
        add2();
        expect(called).toBe(true);
      });
    });

    describe('with an error', function() {
      it('should always return an error', function() {
        var callbackErr, callbackResults;
        join.add()('error', 'has error');
        join.add()(null, 'no error');
        join.when(function(err, results) {
          callbackErr = err;
          callbackResults = results;
        });
        expect(callbackErr).toEqual('error');
        expect(callbackResults).toEqual(['has error']);
      });

      it('should clear waiting `add` callbacks and ignore any new `add` callbacks', function() {
        var add1 = join.add(),
          add2 = join.add(),
          add3 = join.add(),
          callbackErr, callbackResults;
        add2('error', 'has error');
        add1(null, 'ignored1');
        add3(null, 'ignored2');
        join.add()(null, 'ignored3');
        join.when(function(err, results) {
          callbackErr = err;
          callbackResults = results;
        });
        expect(callbackErr).toEqual('error');
        expect(callbackResults).toEqual([undefined, 'has error']);
      });
    });

    describe('an `add` timeout', function() {

      it('should occur after 30 seconds (by default)', function() {
        jasmine.Clock.useMock();

        var called = false;
        join.add(); // callback never called
        join.when(function() {
          called = true;
        });
        jasmine.Clock.tick(1000 * 30);

        expect(called).toBe(true);
      });

      it('should be treated as an error', function() {
        jasmine.Clock.useMock();

        var callbackErr;
        join.add(); // callback never called
        join.when(function(err) {
          callbackErr = err;
        });
        jasmine.Clock.tick(1000 * 30);

        expect(callbackErr.constructor.name).toBe(Error.name);
        expect(callbackErr.message).toEqual('timeout error');
      });
    });

    describe('after `when` has been called', function() {
      beforeEach(function() {
        join.add()(null, 'add1');
        join.when(function() {});
      });

      it('calling `add` and `when` should work as normal', function() {
        var called = false;
        join.add()('add2');
        join.when(function() {
          called = true;
        });
        expect(called).toBe(true);
      });

      it('`results` should not be cleared', function() {
        var callbackResults;
        join.add()(null, 'add2');
        join.when(function(err, results) {
          callbackResults = results;
        });
        expect(callbackResults).toEqual(['add1', 'add2']);
      });
    });

    describe('calling `dispose`', function() {
      beforeEach(function() {
        join.add()(null, 'add1');
      });

      it('then calling `add` should throw an error', function() {
        join.dispose();
        expect(function add() {
          return join.add();
        }).toThrow();
      });

      it('should ignore `add` callbacks', function() {
        var add2 = join.add(),
          add3 = join.add();
        expect(join.results()).toEqual(['add1']);
        add3(null, 'add3');
        join.dispose();
        add2(null, 'add2');
        expect(join.results()).toEqual(['add1', undefined, 'add3']);
      });

      it('should still call `when` callbacks', function() {
        var called = false;
        join.dispose();
        join.when(function() {
          called = true;
        });
        expect(called).toBe(true);
      });
    });
  });
});
