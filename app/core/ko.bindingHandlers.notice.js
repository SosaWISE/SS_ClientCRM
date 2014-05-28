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
          if (seconds <= 1) {
            element.addClass('fast');
          }
          element.addClass('fade');
        }
      });

      element.mouseover(function() {
        if (value.pause()) {
          element.removeClass('fade');
        }
      });
      element.mouseout(function() {
        value.resume();
      });
    }
  };
});
