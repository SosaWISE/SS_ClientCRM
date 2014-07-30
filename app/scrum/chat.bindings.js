define('src/scrum/chat.bindings', [
  'jquery',
  'ko',
], function(
  jquery,
  ko
) {
  "use strict";

  //
  // ui bindings
  //
  ko.bindingHandlers.keepbottom = {
    init: function(element, valueAccessor) {
      var observable = valueAccessor(),
        doScroll = false,
        subs = [],
        timeoutId;
      // add subscriptions after the `foreach` binding
      timeoutId = setTimeout(function() {
        subs.push(observable.subscribe(function() {
          // before the array changes check if the scroll bar is at the bottom
          doScroll = atBottom(element);
        }, null, 'beforeChange'));
        subs.push(observable.subscribe(function() {
          if (doScroll) {
            // after the array has changed keep the scroll bar at the bottom
            scrollBottom(element);
          }
        }));
        // start at the bottom
        scrollBottom(element);
      }, 0);

      // get notified when the element is disposed
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        clearTimeout(timeoutId);
        subs.forEach(function(s) {
          s.dispose();
        });
      });
    },
  };

  function atBottom(element) {
    return element.scrollTop === (element.scrollHeight - element.clientHeight);
  }

  function scrollBottom(element) {
    element.scrollTop = (element.scrollHeight - element.clientHeight);
  }

});
