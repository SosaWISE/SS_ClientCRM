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

    describe('format', function() {
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
    });
  });
});
