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
      var value = valueAccessor(),
        el = jquery(element),
        sub;

      sub = value.seconds.subscribe(function(seconds) {
        if (0 < seconds && seconds <= 3 && !el.hasClass('fade')) {
          if (seconds <= 1) {
            el.addClass('fast');
          }
          el.addClass('fade');
        }
      });
      // dispose of subscription when removed
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        sub.dispose();
      });

      el.mouseover(function() {
        if (value.pause()) {
          el.removeClass('fade');
        }
      });
      el.mouseout(function() {
        value.resume();
      });
    }
  };
});
