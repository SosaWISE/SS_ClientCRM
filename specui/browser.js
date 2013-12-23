/* global runs, waitsFor, expect */
define('specui/browser', [
  'jquery'
], function(
  jquery
) {
  'use strict';

  var browser = {},
    addressBar,
    onReady,
    testWindow,
    document = null;

  // make browser available on test page
  window.browser = browser;

  browser.ready = function($addressBar, cb) {
    delete browser.ready; // can call ready only once
    addressBar = $addressBar;
    onReady = cb;
  };
  browser.init = function(win) {
    delete browser.init; // can call init only once

    if (!onReady) {
      throw new Error('call `ready` with callback in container page first');
    }
    if (!win) {
      throw new Error('test page window must be passed in');
    }
    if (win === window) {
      throw new Error('test page window must be different than container window');
    }
    testWindow = win;
    document = win.document;

    // set address bar text
    addressBar.text(testWindow.location);
    testWindow.addEventListener('hashchange', function() {
      addressBar.text(testWindow.location);
    });

    testWindow.addEventListener("load", onReady, false);
  };


  //
  // functions
  //
  browser.delay = function(fn, milliseconds) {
    if (arguments.length < 2) {
      milliseconds = 500;
    } else {
      milliseconds = milliseconds || 0;
    }
    var done = false;
    runs(function() {
      setTimeout(function() {
        done = true;
      }, milliseconds);
    });
    waitsFor(function() {
      return done;
    }, milliseconds + 10);
    runs(fn);
    return browser; // chaining
  };
  browser.click = function(element) {
    expect(jquery(element)).toBeVisible();
    var evt = new MouseEvent('click', {
      'view': testWindow,
      'bubbles': true,
      'cancelable': true
    });
    element.dispatchEvent(evt);
    return browser; // chaining
  };
  browser.setText = function(element, text) {
    expect(jquery(element)).toBeVisible();
    jquery(element).focus();
    element.value = '';
    for (var i = 0; i < text.length; i++) {
      triggerKey(element, element.value.length, text[i]);
    }
    return browser; // chaining
  };
  browser.pressEnter = function(element) {
    expect(jquery(element)).toBeVisible();
    triggerKey(element, element.value.length, '\r');
    return browser; // chaining
  };

  //
  // element selectors
  //
  browser.anchor = function(selector) {
    return selectOne(selector, HTMLAnchorElement);
  };
  browser.div = function(selector) {
    return selectOne(selector, HTMLDivElement);
  };
  browser.input = function(selector) {
    return selectOne(selector, HTMLInputElement);
  };

  function selectOne(selector, ctor) {
    // adding '#main' exlcudes template files
    var el = document.querySelector('#main ' + selector);
    if (!el) {
      throw new Error('no element selected: ' + selector);
    }
    expect(el.constructor.name).toBe(ctor.name);
    // el = jquery(el);
    return el;
  }

  //
  //
  //
  browser.hasClass = function(element, className) {
    var regx = new RegExp('\\w*' + className + '\\w*');
    return element.nodeType === 1 && regx.test(element.className);
  };


  function triggerKey(element, vLength, letter, charCode) {
    //@HACK: that mimicks a keypress
    // http://stackoverflow.com/a/4176116
    // http://stackoverflow.com/questions/4158847/is-there-a-way-to-simulate-key-presses-or-a-click-with-javascript/4176116#4176116
    var canceled = !dispatchKeyboardEvent(element,
      'keydown', true, true, // type, bubbles, cancelable
      null, // window
      letter, // key
      0, // location: 0=standard, 1=left, 2=right, 3=numpad, 4=mobile, 5=joystick
      false, // ctrl
      false, // alt
      false, // shift
      false, // meta
      charCode,
      0
    );
    dispatchKeyboardEvent(element, 'keypress', true, true, null, letter, 0, false, false, false, false, charCode, 0);
    if (!canceled && vLength === element.value.length) {
      if (dispatchTextEvent(element, 'textInput', true, true, null, letter, 0, false, false, false, false, charCode, 0) && vLength === element.value.length) {
        // shouldn't ever get here, but incase the element still doesn't have the value manually append it
        element.value += letter;
        dispatchSimpleEvent(element, 'input', false, false);
        // not supported in Chrome yet
        // if (element.form) element.form.dispatchFormInput();
        dispatchSimpleEvent(element, 'change', false, false);
        // not supported in Chrome yet
        // if (element.form) element.form.dispatchFormChange();
      }
    }
    dispatchKeyboardEvent(element, 'keyup', true, true, null, letter, 0, '');
  }

  //
  // DOM 3 Events
  //

  function dispatchKeyboardEvent(target, type, bubbles, cancelable, view, key, location, ctrl, alt, shift, meta, charCode, keyCode /*, initKeyboradEvent_args*/ ) {
    var e = document.createEvent("KeyboardEvents");
    e.initKeyboardEvent(type, bubbles, cancelable, view, key, location, ctrl, alt, shift, meta, charCode, keyCode);
    // e.initTextEvent.apply(e, Array.prototype.slice.call(arguments, 1));

    // makes enter key work
    // http://stackoverflow.com/a/10520017
    // http://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key/10520017#10520017
    delete e.keyCode;
    e.keyCode = key.charCodeAt(0);
    delete e.charCode;
    e.charCode = key.charCodeAt(0);
    delete e.which;
    e.which = key.charCodeAt(0);

    return target.dispatchEvent(e);
  }

  function dispatchTextEvent(target /*, initTextEvent_args*/ ) {
    var e = document.createEvent("TextEvent");
    e.initTextEvent.apply(e, Array.prototype.slice.call(arguments, 1));
    return target.dispatchEvent(e);
  }

  function dispatchSimpleEvent(target /*, type, canBubble, cancelable*/ ) {
    var e = document.createEvent("Event");
    e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
    return target.dispatchEvent(e);
  }

  return browser;
});
