define('src/core/ko.bindingHandlers.all', [
  'jquery',
  'ko',
  // include other handlers
  'src/core/ko.bindingHandlers.cmd',
  'src/core/ko.bindingHandlers.formatters',
  'src/core/ko.bindingHandlers.notice',
  'src/core/ko.bindingHandlers.value',
], function(
  jquery,
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
          el = jquery(element);
        if (hasVal) {
          // setTimeout(function() { // needed for browser transitions????
          el.addClass(cls);
          // }, 0);
        } else {
          // setTimeout(function() {
          el.removeClass(cls);
          // }, 0);
        }
      },
    };
  }
  createToggleClassHandler('active');
  createToggleClassHandler('editing');
  createToggleClassHandler('busy');
  createToggleClassHandler('cssDisabled', 'disabled');
  ko.bindingHandlers.toggle = {
    update: function(element, valueAccessor) {
      var obj = valueAccessor(),
        el = jquery(element);
      Object.keys(obj).forEach(function(cls) {
        var hasVal = unwrap(obj[cls]);
        if (hasVal) {
          // setTimeout(function() { // needed for browser transitions
          el.addClass(cls);
          // }, 0);
        } else {
          // setTimeout(function() {
          el.removeClass(cls);
          // }, 0);
        }
      });
    },
  };

  // key handlers
  //---------------------------

  function createKeyHandler(name, keyCode, forceBlur) {
    ko.bindingHandlers[name] = {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var func = valueAccessor();
        // if it's a command we need the execute function
        if (ko.isCommand(func)) {
          func = func.execute;
        }

        jquery(element).keyup(function(event) {
          if (event.keyCode === keyCode) {
            if (forceBlur) {
              jquery(element).blur();
              jquery(element).focus();
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
      element = jquery(element);
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
        el = jquery(element);
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
      jquery(element).css({
        "background-image": url ? ("url(" + url + ")") : "",
      });
    },
  };


  // size
  //---------------------------

  function createSizeHandler(name) {
    ko.bindingHandlers[name] = {
      update: function(element, valueAccessor) {
        var size = ko.utils.unwrapObservable(valueAccessor());
        if (size) {
          size += "";
          size = size.match(/%$/) ? size : size + "px";
        } else {
          size = "";
        }

        jquery(element).css(name, size);
      },
    };
  }
  createSizeHandler('width');
  createSizeHandler('height');


  //@NOTE: instead use the table approach used by the OP, since no javascript is needed
  // // fillheight
  // //---------------------------
  // ko.bindingHandlers.fillheight = {
  //   update: function(element, valueAccessor) {
  //     valueAccessor = unwrap(valueAccessor());
  //     // http://stackoverflow.com/questions/90178/make-a-div-fill-the-remaining-screen-space
  //     // Element Height = Viewport height - element.offset.top - desired bottom margin
  //     // jquery(element).height(element.offsetParent.offsetHeight - element.offsetTop);
  //
  //     // element = jquery(element);
  //     jquery(element).height(jquery(element).parent().height() - element.offsetTop);
  //   },
  // };


  // scroll element into view
  //---------------------------
  ko.bindingHandlers.scrollTop = {
    update: function(element, valueAccessor) {
      if (unwrap(valueAccessor())) {
        element.scrollIntoView();
      }
    },
  };

  // scroll element to middle
  //---------------------------
  ko.bindingHandlers.scrollMiddle = {
    update: function(element, valueAccessor, allBindingsAccessor) {
      if (unwrap(valueAccessor())) {
        var top, parent, up = allBindingsAccessor().up || 1;
        parent = element;
        while (up > 0 && parent.parentNode) {
          parent = parent.parentNode;
          up--;
        }
        top = documentOffsetTop(element) - (parent.clientHeight / 2);
        top = element.offsetTop - parent.offsetTop;
        top = top - (parent.clientHeight / 2) + (element.clientHeight / 2);
        parent.scrollTop = top;
      }
    },
  };

  function documentOffsetTop(element) {
    return element.offsetTop + (element.offsetParent ? documentOffsetTop(element.offsetParent) : 0);
  }


  // select element
  //---------------------------
  ko.bindingHandlers.select = {
    update: function(element, valueAccessor) {
      var observable = valueAccessor();
      if (observable()) {
        element.focus();
        element.select();
        observable(false);
      }
    },
  };
  // deselect element
  //---------------------------
  ko.bindingHandlers.deselect = {
    update: function(element, valueAccessor) {
      var observable = valueAccessor();
      if (observable()) {
        if (element.selectionEnd !== element.selectionStart) {
          element.selectionEnd = element.selectionStart;
        }
        observable(false);
      }
    },
  };

});
