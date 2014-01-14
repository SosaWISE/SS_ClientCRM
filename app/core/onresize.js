define('src/core/onresize', [
 'underscore',
], function(
  underscore
) {
  "use strict";

  // http://stackoverflow.com/questions/4811925/how-to-run-a-function-everytime-a-div-changes-its-size
  // some code copied from here: https://raw.github.com/marcj/css-element-queries/master/src/ResizeSensor.js
  //@NOTE: Without debouncing, css transitions were really transitions

  var _style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;',
    _innerHTML = '<div class="resize-sensor-overflow" style="' + _style + '"><div></div></div>' +
      '<div class="resize-sensor-underflow" style="' + _style + '"><div></div></div>';

  // returns computed style
  function getComputedStyle(el, prop) {
    if (el.currentStyle) {
      return el.currentStyle[prop];
    } else if (window.getComputedStyle) {
      return window.getComputedStyle(el, null).getPropertyValue(prop);
    } else {
      return el.style[prop];
    }
  }
  //
  function EventQueue() {
    var list = [];
    this.add = function(ev) {
      // add to the beginning of the list for reverse loop
      list.unshift(ev);
    };
    this.call = function() {
      // reverse loop items in list
      var i = list.length;
      while (i--) {
        list[i].call();
      }
    };
  }
  // add listener to the over/under-flow events.
  function listen(el, listener) {
    if (window.OverflowEvent) {
      //webkit
      el.addEventListener('overflowchanged', listener);
    } else {
      el.addEventListener('overflow', listener);
      el.addEventListener('underflow', listener);
    }
  }

  // detect when size of element changes
  function onresize(el, onResize, throttle) {
    if (!el) {
      throw new Error('no el');
    }
    if (typeof(onResize) !== 'function') {
      throw new Error('onResize not a function');
    }

    if (!el.resizedAttached) {
      el.resizedAttached = new EventQueue();
      el.resizedAttached.add(onResize);
    } else if (el.resizedAttached) {
      el.resizedAttached.add(onResize);
      return;
    }

    var x = 0,
      y = 0,
      sensorEl,
      firstEl, firstChildStyle,
      lastEl, lastChildStyle,
      listener;

    listener = underscore.debounce(function() {
      if (setupSensor()) {
        console.log('resized:', el);
        el.resizedAttached.call();
      }
    }, throttle || 100);

    if ('onresize' in el) {
      //
      // internet explorer
      //
      if (el.attachEvent) {
        el.attachEvent('onresize', listener);
      } else if (el.addEventListener) {
        el.addEventListener('resize', listener);
      }
      return;
    }

    //
    // other browsers
    //
    sensorEl = document.createElement('div');
    sensorEl.className = 'resize-sensor';
    sensorEl.style.cssText = _style;
    sensorEl.innerHTML = _innerHTML;
    el.appendChild(sensorEl);

    firstEl = sensorEl.firstElementChild;
    lastEl = sensorEl.lastElementChild;
    firstChildStyle = firstEl.firstChild.style;
    lastChildStyle = lastEl.firstChild.style;

    if ('absolute' !== getComputedStyle(el, 'position')) {
      el.style.position = 'relative';
    }

    function setupSensor() {
      var changed = false,
        width = sensorEl.offsetWidth,
        height = sensorEl.offsetHeight;

      if (x !== width) {
        firstChildStyle.width = (width - 1) + 'px';
        lastChildStyle.width = (width + 1) + 'px';
        changed = true;
        x = width;
      }
      if (y !== height) {
        firstChildStyle.height = (height - 1) + 'px';
        lastChildStyle.height = (height + 1) + 'px';
        changed = true;
        y = height;
      }
      return changed;
    }
    setupSensor();

    listen(sensorEl, listener);
    listen(firstEl, listener);
    listen(lastEl, listener);
  }

  return onresize;
});
