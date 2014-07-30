/* global beforeEach,describe,it,expect */
define('src/core/linkedlist.spec', [
  'src/core/linkedlist'
], function(LinkedList) {
  "use strict";

  describe('LinkedList', function() {
    var list;
    beforeEach(function() {
      list = new LinkedList();
    });

    it('`head` should be a function', function() {
      expect(typeof list.head).toBe('function');
    });
    it('`tail` should be a function', function() {
      expect(typeof list.tail).toBe('function');
    });
    it('`append` should be a function', function() {
      expect(typeof list.append).toBe('function');
    });
    it('`remove` should be a function', function() {
      expect(typeof list.remove).toBe('function');
    });
    it('`findFirstNode` should be a function', function() {
      expect(typeof list.findFirstNode).toBe('function');
    });
    it('`findLastNode` should be a function', function() {
      expect(typeof list.findLastNode).toBe('function');
    });

    describe('head', function() {
      it('should start null', function() {
        expect(list.head()).toBe(null);
      });
    });
    describe('tail', function() {
      it('should start null', function() {
        expect(list.tail()).toBe(null);
      });
    });

    describe('append', function() {
      describe('first item', function() {
        beforeEach(function() {
          list.append('bob');
        });

        it('should set head and tail', function() {
          expect(list.head()).not.toBe(null);
          expect(list.head().value).toBe('bob');
          expect(list.tail()).not.toBe(null);
          expect(list.tail().value).toBe('bob');
        });
        it('`length` should be 1', function() {
          expect(list.length).toBe(1);
        });
      });

      it('at end should update `tail`', function() {
        list.append('two');
        expect(list.tail().value).toBe('two');
      });
    });

    describe('remove', function() {
      describe('last item', function() {
        beforeEach(function() {
          list.append('bob');
          list.remove('bob');
        });

        it('should set head and tail', function() {
          expect(list.head()).toBe(null);
          expect(list.tail()).toBe(null);
        });
        it('`length` should be 0', function() {
          expect(list.length).toBe(0);
        });
      });
    });

  });
});
