define('src/core/ko.bindingHandlers.mover', [
  'jquery',
  'ko'
], function(
  jquery,
  ko
) {
  "use strict";

  var pad = 10;

  ko.bindingHandlers.mover = {
    init: function(element, valueAccessor) {
      var el = jquery(element),
        moveEl = jquery(element),
        upParents = Math.max(0, parseInt(ko.unwrap(valueAccessor()), 10)),
        info;
      while (upParents--) {
        moveEl = moveEl.parent();
      }

      el.mousedown(function(evt) {
        el.addClass('dragging');
        var parent = moveEl.parent(),
          maxHeight = (parent.height() - moveEl.height() - pad) / 2,
          maxWidth = (parent.width() - moveEl.width() - pad) / 2,
          top = parseInt(moveEl.css('top'), 10) || 0,
          left = parseInt(moveEl.css('left'), 10) || 0;
        info = {
          maxY: maxHeight,
          minY: maxHeight * -1,
          maxX: maxWidth,
          minX: maxWidth * -1,
          clientY: evt.clientY - top,
          clientX: evt.clientX - left,
        };
      });

      jquery(document)
        .mouseup(function() {
          el.removeClass('dragging');
          info = null;
        })
        .mousemove(function(evt) {
          if (!info) {
            return;
          }
          var top = evt.clientY - info.clientY,
            left = evt.clientX - info.clientX;

          // keep in bounds
          top = Math.min(Math.max(top, info.minY), info.maxY);
          left = Math.min(Math.max(left, info.minX), info.maxX);

          moveEl.css({
            top: top + 'px',
            left: left + 'px',
          });
        });
    }
  };
});
