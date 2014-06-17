/* global describe,it,expect,beforeEach,spyOn,jasmine */
define('src/core/mockery.spec', [
  'src/core/utils',
  'src/core/mockery'
], function(
  utils,
  mockery
) {
  "use strict";

  // mockery.random = Math.random;

  describe('mockery', function() {

    describe('literal text', function() {
      var resp;
      beforeEach(function() {
        resp = mockery.fromTemplate({
          num: 1,
          empty: '',
          bob: 'bob',
        });
      });

      it('should NOT change', function() {
        expect(resp.num).toBe(1);
        expect(resp.empty).toBe('');
        expect(resp.bob).toBe('bob');
      });
    });

    describe('strings w/ tokens', function() {
      var resp;
      beforeEach(function() {
        spyOn(mockery.fn, 'NUMBER').andReturn(10);
        resp = mockery.fromTemplate({
          num: '@NUMBER(1,2)',
        });
      });

      it('should call corresponding fn function', function() {
        expect(mockery.fn.NUMBER).toHaveBeenCalled();
        expect(resp.num).toBe(10);
      });
      it('should call function with params', function() {
        var expectedCache = {
          'NUMBER(1,2)': 10
        };
        expect(mockery.fn.NUMBER).toHaveBeenCalledWith(jasmine.objectContaining(expectedCache), '1', '2');
      });
    });

    describe('array templates', function() {
      var resp;
      beforeEach(function() {
        resp = mockery.fromTemplate({
          'names': [
            '@NAME',
          ],
        });
      });

      it('should be an array', function() {
        expect(Array.isArray(resp.names)).toBe(true);
        expect(resp.names.length).toBeGreaterThan(0);
      });
    });

    describe('function results', function() {
      var resp;
      beforeEach(function() {
        resp = mockery.fromTemplate({
          name: '@NAME',
          name2: '@NAME',
          name3: '@NAME',

          num: '@NUMBER(1,1)',
          num2: '@NUMBER(2,2)',

          'names|3-3': [
            '@NAME',
          ],
        }, Math.random); // sometimes tests fail from lack of randomness
      });

      it('should be cached per call', function() {
        expect(resp.name2).toBe(resp.name);
        expect(resp.name3).toBe(resp.name);
      });
      it('cache key should should include param values', function() {
        expect(resp.num).toBe(1);
        expect(resp.num2).toBe(2);
      });
      it('should reset cache for each array value', function() {
        expect(resp.names[0]).not.toBe(resp.name);
        expect(resp.names[1]).not.toBe(resp.name);
        expect(resp.names[2]).not.toBe(resp.name);
        expect(resp.names[1]).not.toBe(resp.names[0]);
        expect(resp.names[2]).not.toBe(resp.names[0]);
      });
    });

    describe('property names w/ range values (eg: name|1-10)', function() {
      var resp,
        expectedName = 'bob+';
      beforeEach(function() {
        spyOn(mockery.fn, 'NAME').andReturn('bob');
        resp = mockery.fromTemplate({
          'txt|5-10': '@NAME+',
          'ray|5-10': ['@NAME+'],
        });
      });

      it('for strings it should repeat the string that many times', function() {
        expect(typeof(resp.txt)).toBe('string');
        expect(resp.txt.length).toBeGreaterThan((5 * expectedName.length) - 1);
        expect(resp.txt.length).toBeLessThan((10 * expectedName.length) + 1);
      });
      it('for arrays it should add that many items', function() {
        expect(Array.isArray(resp.ray)).toBe(true);
        expect(resp.ray.length).toBeGreaterThan(4);
        expect(resp.ray.length).toBeLessThan(11);
        resp.ray.forEach(function(name) {
          expect(name).toBe(expectedName);
        });
      });
    });

    describe('built-in function', function() {
      var resp;
      beforeEach(function() {
        // temporarily override NOW function
        var tmpNOW = mockery.fn.NOW;
        mockery.fn.NOW = function() {
          return new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6));
        };

        resp = mockery.fromTemplate({
          bool: '@BOOL',
          num: '@NUMBER',
          img: '@IMG(10,20,bob)',
          txt: '@TEXT(20,20)',
          txtLong: '@TEXT(600,600)',
          phone: '@PHONE',
          email: '@EMAIL',
          id1: '@INC(bob)',
          id2: '@INC(bob,cachebuster)',
          id3: '@INC(frank)',
          datetime: '@DATETIME',
          datetimeParams1: '@DATETIME(0,10)', // between now and 10 days in the future
          datetimeParams2: '@DATETIME(-10,0)', // between 10 days in the past and now
          datetimeParams3: '@DATETIME(-10,10)', // between 10 days in the past and 10 days in the future
        }, Math.random);

        // re-set NOW function
        mockery.fn.NOW = tmpNOW;
      });

      it('@BOOL should return a boolean', function() {
        expect(typeof(resp.bool)).toBe('boolean');
      });
      it('@NUMBER should return a number', function() {
        expect(typeof(resp.num)).toBe('number');
      });
      it('@IMG should match expected', function() {
        expect(resp.img).toBe('http://lorempixel.com/10/20/bob');
      });
      it('@TEXT should correct length', function() {
        expect(resp.txt.length).toBe(20);
        expect(resp.txtLong.length).toBe(600);
      });
      it('@PHONE should match pattern', function() {
        // // (123) 123-1234
        // expect(/^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/.test(resp.phone)).toBe(true);
        // 1231231234
        expect(/^[0-9]{10}$/.test(resp.phone)).toBe(true);
      });
      it('@EMAIL should match pattern', function() {
        // a.b@c.d
        expect(/^[^@]+@[^@.]+.[^@.]+$/.test(resp.email)).toBe(true);
      });
      it('@INC should increment that group', function() {
        expect(typeof(resp.id1)).toBe('number');
        expect(resp.id2).toBe(resp.id1 + 1);
        expect(resp.id3).toBeLessThan(resp.id1);
      });

      it('@DATETIME with zero params should return a random date', function() {
        expect(utils.isDate(resp.datetime)).toBe(true);
      });
      it('@DATETIME with two params should return a random date within the parameters', function() {
        expect(utils.isDate(resp.datetimeParams1)).toBe(true);
        expect(resp.datetimeParams1 >= new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6))).toBe(true, 'datetimeParams1 not >= now');
        expect(resp.datetimeParams1 <= new Date(Date.UTC(2000, 5, 20, 9, 8, 7, 6))).toBe(true, 'datetimeParams1 not <= 10 days in the future');

        expect(utils.isDate(resp.datetimeParams2)).toBe(true);
        expect(resp.datetimeParams2 >= new Date(Date.UTC(2000, 4, 31, 9, 8, 7, 6))).toBe(true, 'datetimeParams2 not >= 10 days in the past');
        expect(resp.datetimeParams2 <= new Date(Date.UTC(2000, 5, 10, 9, 8, 7, 6))).toBe(true, 'datetimeParams2 not <= now');

        expect(utils.isDate(resp.datetimeParams3)).toBe(true);
        expect(resp.datetimeParams3 >= new Date(Date.UTC(2000, 4, 31, 9, 8, 7, 6))).toBe(true, 'datetimeParams3 not >= 10 days in the past');
        expect(resp.datetimeParams3 <= new Date(Date.UTC(2000, 5, 20, 9, 8, 7, 6))).toBe(true, 'datetimeParams3 not <= 10 days in the future');
      });
    });
  });
});
