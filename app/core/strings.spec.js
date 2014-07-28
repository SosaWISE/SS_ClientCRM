/* global describe, it, expect */
define('src/core/strings.spec', [
  'src/core/strings',
], function(strings) {
  "use strict";

  describe('strings', function() {
    // var vm;
    // beforeEach(function() {});

    it('should have an `format` function', function() {
      expect(typeof(strings.format)).toBe('function');
    });
    it('should have an `joinTrimmed` function', function() {
      expect(typeof(strings.joinTrimmed)).toBe('function');
    });

    describe('format params', function() {
      it('should insert params using zero-based indexing', function() {
        expect(strings.format('{1}{0}{1} {1}{0}{1}{1}ins', 'o', 'b')).toBe('bob bobbins');
      });
      it('should ignore unused params', function() {
        expect(strings.format('{2}{0}{2} {2}{0}{2}{2}ins', 'o', 'ignore me', 'b')).toBe('bob bobbins');
      });
      it('brackets not used for formatting should be left alone', function() {
        expect(strings.format('{{1}{0}{1}}}', 'o', 'b')).toBe('{bob}}');
        expect(strings.format('{{1{', 'o', 'b')).toBe('{{1{');
      });
      it('should use empty string for missing args', function() {
        expect(strings.format('<{0}{1}{2}>', '1')).toBe('<1>');
      });
      it('should correctly replace larger numbers', function() {
        expect(strings.format('<{1}-{10}>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10')).toBe('<1-10>');
      });

      describe('w/ :c decorator', function() {
        it('should format as US currency', function() {
          expect(strings.format('{0:c}', 12345678.9)).toBe('$12,345,678.90');
        });
        it('should be NaN if not a number', function() {
          expect(strings.format('{0:c}', '1234.5abcde')).toBe('NaN');
        });
      });

      describe('w/ :space decorator', function() {
        it('should insert non-breaking spaces between each character', function() {
          expect(strings.format('{0:space}', 'A A')).toBe('A&nbsp; &nbsp;A');
        });
      });
    });

    describe('joinTrimmed', function() {
      it('should join on first param', function() {
        expect(strings.joinTrimmed(':', 'a', 'b')).toBe('a:b');
        expect(strings.joinTrimmed('', 'a', 'b')).toBe('ab');
      });
      it('should accept an array as the second param', function() {
        expect(strings.joinTrimmed(':', ['a', 'b'], 'ignored')).toBe('a:b');
      });
      it('should exclude falsey values from join', function() {
        expect(strings.joinTrimmed(' ', '  ', ' ', undefined, null, 'a', 'b  ', 'c', 'd')).toBe('a b c d');
      });
    });

    describe('padLeft', function() {
      it('should prepend text', function() {
        expect(strings.padLeft('9', '0', 3)).toBe('009');
        expect(strings.padLeft('9', '00', 4)).toBe('00009');
      });
      it('should convert number to text before prepending', function() {
        expect(strings.padLeft(9, '0', 3)).toBe('009');
        expect(strings.padLeft(0, '1', 3)).toBe('110');
      });
      it('null and undefined should be treated as empty string', function() {
        expect(strings.padLeft(null, '1', 3)).toBe('111');
      });
    });
    describe('padRight', function() {
      it('should append text', function() {
        expect(strings.padRight('9', '0', 3)).toBe('900');
        expect(strings.padRight('9', '00', 4)).toBe('90000');
      });
      it('should convert number to text before appending', function() {
        expect(strings.padRight(9, '0', 3)).toBe('900');
        expect(strings.padRight(0, '1', 3)).toBe('011');
      });
      it('null and undefined should be treated as empty string', function() {
        expect(strings.padRight(null, '1', 3)).toBe('111');
      });
    });
  });
});
