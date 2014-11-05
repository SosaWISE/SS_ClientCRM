define('src/core/ko.bindingHandlers.dropimg', [
  'src/core/notify',
  'src/core/utils',
  'jquery',
  'ko'
], function(
  notify,
  utils,
  jquery,
  ko
) {
  "use strict";
  ko.bindingHandlers.dropimg = {
    init: function(element, valueAccessor) {
      var fn = ko.unwrap(valueAccessor());
      if (!utils.isFunc(fn)) {
        throw new Error('expected function');
      }

      element.addEventListener("dragover", function(e) {
        e.preventDefault();
      }, true);
      element.addEventListener("drop", function(e) {
        e.preventDefault();
        var src = e.dataTransfer.files[0];
        //  Prevent any non-image file type from being read.
        if (!src.type.match(/image.*/)) {
          notify.warn('The dropped file is not an image: ' + src.type, null, 7);
          return;
        }
        // clear current image
        fn(null);
        //  Create our FileReader and run the results through the render function.
        var reader = new FileReader();
        reader.onload = function(e) {
          fn(e.target.result);
        };
        reader.readAsDataURL(src);
      }, true);
    },
  };
});
