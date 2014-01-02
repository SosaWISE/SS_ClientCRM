define('src/core/ko.bindingHandlers.notice', [
  'jquery',
  'ko'
], function(
  jquery,
  ko
) {
  "use strict";

  ko.bindingHandlers.notice = {
    init: function(element, valueAccessor) {
      var value = valueAccessor();

      element = jquery(element);

      value.seconds.subscribe(function(seconds) {
        if (0 < seconds && seconds <= 5 && !element.hasClass('fade')) {
          element.addClass('fade');
        }
      });

      element.mouseover(function() {
        element.removeClass('fade');
        value.pause();
      });
      element.mouseout(function() {
        value.resume();
      });
    }
  };
});
