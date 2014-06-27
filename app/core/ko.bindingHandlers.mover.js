define('src/core/ko.bindingHandlers.mover', [
  'jquery',
  'ko'
], function(
  jquery,
  ko
) {
  "use strict";

  // var pad = 10;

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
        if (evt.button !== 0) {
          // return if not a left click
          return;
        }
        if (evt.target !== element) {
          // only move if mover element is the target of the event
          return;
        }

        el.addClass('dragging');
        var parent = moveEl.parent(),
          height = moveEl.height(),
          width = moveEl.width(),
          pheight = parent.height(),
          pwidth = parent.width(),
          top = parseInt(moveEl.css('top'), 10) || 0,
          left = parseInt(moveEl.css('left'), 10) || 0;
        info = {
          // stop 10px before layer leaves page
          maxY: (pheight - height - 10) / 2, // bottom
          maxX: (pwidth - width - 10) / 2, // right
          // leave 100px of layer showing
          minY: (pheight + height - 100) / -2, // top
          minX: (pwidth + width - 100) / -2, // left
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
