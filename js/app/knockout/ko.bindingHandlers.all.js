define([
  'jquery',
  'ko',
  // include other handlers
  './ko.bindingHandlers.cmd',
  './ko.bindingHandlers.notice',
  './ko.bindingHandlers.value'
], function(
  $,
  ko
) {
  "use strict";

  var unwrap = ko.utils.unwrapObservable;


  // toggle classes
  //---------------------------

  function createToggleClassHandler(name, cls) {
    cls = cls || name;
    ko.bindingHandlers[name] = {
      update: function(element, valueAccessor) {
        var hasVal = unwrap(valueAccessor()),
          el = $(element);
        if (hasVal) {
          setTimeout(function() { // needed for browser transitions????
            el.addClass(cls);
          }, 0);
        } else {
          setTimeout(function() {
            el.removeClass(cls);
          }, 0);
        }
      },
    };
  }
  createToggleClassHandler('active');
  createToggleClassHandler('editing');
  createToggleClassHandler('cssDisabled', 'disabled');
  createToggleClassHandler('fullheight');
  createToggleClassHandler('fullwidth');


  // key handlers
  //---------------------------

  function createKeyHandler(name, keyCode, forceBlur) {
    ko.bindingHandlers[name] = {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var func = valueAccessor();
        $(element).keyup(function(event) {
          if (event.keyCode === keyCode) {
            if (forceBlur) {
              $(element).blur();
              $(element).focus();
            }
            func.call(viewModel, viewModel, event);
          }
        });
      },
    };
  }
  createKeyHandler('escape', 27); // <ESC>
  createKeyHandler('enter', 13, true);


  // swapLoginFields
  //---------------------------
  //@NOTE: this only works one time
  ko.bindingHandlers.swapLoginFields = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      element = $(element);
      var loginformEl = document.getElementById('loginform');
      // replace placeholders with the actual fields from hidden form
      element.find('.ph-loginform').replaceWith(loginformEl);
      // set current browser values on viewModel
      viewModel.username(element.find('.email').val());
      viewModel.password(element.find('.password').val());
    },
  };


  // setClass
  //---------------------------
  ko.bindingHandlers.setClass = {
    update: function(element, valueAccessor) {
      var cls = unwrap(valueAccessor()),
        el = $(element);
      if (valueAccessor._prevCls) {
        el.removeClass(valueAccessor._prevCls);
      }
      if (cls) {
        valueAccessor._prevCls = cls;
        el.addClass(cls);
      }
    },
  };

  // bgimg
  //---------------------------
  ko.bindingHandlers.bgimg = {
    update: function(element, valueAccessor) {
      var url = unwrap(valueAccessor());
      $(element).css({
        "background-image": url ? ("url(" + url + ")") : "",
      });
    },
  };
});
