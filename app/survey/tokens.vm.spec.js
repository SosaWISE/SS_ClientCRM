/* global describe,beforeEach, it, expect */
define('src/survey/tokens.vm.spec', [
  'src/survey/tokens.vm',
], function(
  TokensViewModel
) {
  'use strict';

  describe('TokensViewModel', function() {
    var vm;
    beforeEach(function() {
      vm = new TokensViewModel();
      vm.tokenMap[1] = {
        TokenID: 1,
        Token: 'Prop1',
      };
      vm.tokenMap[2] = {
        TokenID: 2,
        Token: 'Prop2',
      };
      vm.tokenMap[21] = {
        TokenID: 21,
        Token: 'Prop2.Prop1',
      };
    });

    it('should have an `stringifyContext` function', function() {
      expect(typeof vm.stringifyContext).toBe('function');
    });
    it('should have an `parseContext` function', function() {
      expect(typeof vm.parseContext).toBe('function');
    });

    describe('stringifyContext', function() {
      it('should flatten and stringify the context', function() {
        expect(vm.stringifyContext({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          }
        })).toBe('{"1":1,"21":21}');
      });
    });

    describe('parseContext', function() {
      it('should parse and unflatten the context', function() {
        expect(vm.parseContext('{"1":1,"21":21}')).toEqual({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          }
        });
      });
    });
  });
});
