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
    it('should have an `createTokenValueFunc` function', function() {
      // this function could be static but it's easier to have it a member function
      expect(typeof vm.createTokenValueFunc).toBe('function');
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
      it('should exclude unknown tokens', function() {
        expect(vm.stringifyContext({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          },
          UnknownProp: 123,
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

    describe('createTokenValueFunc', function() {
      it('should get token values', function() {
        var dataContext = {
            Prop1: 1,
            Prop2: {
              Prop1: 21,
            }
          },
          tokenValueFunc = vm.createTokenValueFunc(dataContext);
        expect(tokenValueFunc('Prop1')).toEqual(1);
        expect(tokenValueFunc('Prop2.Prop1')).toEqual(21);
      });
      it('should set token values', function() {
        var dataContext = {
            Prop1: 1,
            Prop2: {
              Prop1: 21,
            }
          },
          tokenValueFunc = vm.createTokenValueFunc(dataContext);
        tokenValueFunc('Prop3', 3);
        tokenValueFunc('Prop2.Prop2', 22);
        expect(tokenValueFunc('Prop3')).toEqual(3);
        expect(tokenValueFunc('Prop2.Prop2')).toEqual(22);
      });
    });
  });
});
