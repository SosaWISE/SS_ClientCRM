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
      vm.tokenMap[3] = {
        TokenID: 3,
        Token: 'Prop3',
      };
    });

    it('should have an `deflateContext` function', function() {
      expect(typeof vm.deflateContext).toBe('function');
    });
    it('should have an `stringifyContext` function', function() {
      expect(typeof vm.stringifyContext).toBe('function');
    });
    it('should have an `parseContext` function', function() {
      expect(typeof vm.parseContext).toBe('function');
    });
    it('should have an `createTokenValueFunc` function', function() {
      // this function could be static but it is easier to have it a member function
      expect(typeof vm.createTokenValueFunc).toBe('function');
    });

    describe('deflateContext', function() {
      it('should flatten the context', function() {
        expect(vm.deflateContext({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          },
          Prop3: null,
        })).toEqual({ // keys get put in incrementing order
          '1': 1,
          '3': null,
          '21': 21
        });
      });
      it('should exclude unknown tokens', function() {
        expect(vm.deflateContext({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          },
          Prop3: null,
          UnknownProp: 123,
        })).toEqual({
          '1': 1,
          '3': null,
          '21': 21
        });
      });
    });

    describe('stringifyContext', function() {
      it('should flatten and stringify the context', function() {
        expect(vm.stringifyContext({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          },
          Prop3: null,
        })).toBe('{"1":1,"3":null,"21":21}'); // keys get put in incrementing order
      });
      it('should exclude unknown tokens', function() {
        expect(vm.stringifyContext({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          },
          Prop3: null,
          UnknownProp: 123,
        })).toBe('{"1":1,"3":null,"21":21}');
      });
      it('should stringify an already flattened context', function() {
        expect(vm.stringifyContext({
          '1': 1,
          '3': null,
          '21': 21
        }, true)).toBe('{"1":1,"3":null,"21":21}'); // keys get put in incrementing order
      });
    });

    describe('parseContext', function() {
      it('should parse and unflatten the context', function() {
        expect(vm.parseContext('{"1":1,"3":null,"21":21}')).toEqual({
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          },
          Prop3: null,
        });
      });
    });

    describe('createTokenValueFunc', function() {
      var dataContext,
        tokenValueFunc;
      beforeEach(function() {
        dataContext = {
          Prop1: 1,
          Prop2: {
            Prop1: 21,
          },
          Prop3: null,
        };
        tokenValueFunc = vm.createTokenValueFunc(dataContext);
      });

      it('should get token values', function() {
        expect(tokenValueFunc('Prop1')).toBe(1);
        expect(tokenValueFunc('Prop2.Prop1')).toBe(21);
      });
      it('should set token values', function() {
        tokenValueFunc('Prop3', 3);
        expect(tokenValueFunc('Prop3')).toBe(3);
      });
      it('should not set invalid token values', function() {
        tokenValueFunc('Prop2.Prop2', 22);
        expect(tokenValueFunc('Prop2.Prop2')).toBeUndefined();
      });
    });

    describe('createTokenValueFunc(flat)', function() {
      var flatContext,
        tokenValueFunc;
      beforeEach(function() {
        flatContext = {
          '1': 1,
          '3': null,
          '21': 21
        };
        tokenValueFunc = vm.createTokenValueFunc(flatContext, true);
      });

      it('should get token values', function() {
        expect(tokenValueFunc('Prop1')).toBe(1);
        expect(tokenValueFunc('Prop2.Prop1')).toBe(21);
      });
      it('should set token values', function() {
        tokenValueFunc('Prop3', 3);
        expect(tokenValueFunc('Prop3')).toBe(3);
      });
      it('should not set invalid token values', function() {
        tokenValueFunc('Prop2.Prop2', 22);
        expect(tokenValueFunc('Prop2.Prop2')).toBeUndefined();
      });
    });
  });
});
