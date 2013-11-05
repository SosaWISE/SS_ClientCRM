define('spec/app/util/strings.spec', [
  'src/util/strings'
], function(strings) {
  "use strict";

  describe('strings', function() {
    // var vm;
    // beforeEach(function() {});

    it('should have an `format` property', function() {
      expect(strings.format).toBeDefined();
      expect(typeof(strings.format) === 'function').toBeDefined();
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
  });
});
