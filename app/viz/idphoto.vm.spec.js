/* global describe, it, expect */
define('src/viz/idphoto.vm.spec', [
  'src/viz/idphoto.vm'
], function(IdPhotoViewModel) {
  "use strict";

  describe('IdPhotoViewModel', function() {
    // var vm;
    // beforeEach(function() {});

    it('should have a `scaleFactorToBounds` property', function() {
      expect(typeof IdPhotoViewModel.scaleFactorToBounds).toBe('function');
    });

    it('`scaleFactorToBounds` should ______', function() {
      var item = {
        width: 100,
        height: 150,
      };
      var factor = IdPhotoViewModel.scaleFactorToBounds(item.width, item.height, 500, 500);
      expect(factor).toBe(5);
      expect(item.width * factor).toBe(500);
      expect(item.height * factor).toBe(750);
    });
  });
});
