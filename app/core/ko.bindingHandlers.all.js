define('src/core/ko.bindingHandlers.all', [
  'jquery',
  'ko',
  'src/core/utils',
  // include other handlers
  'src/core/ko.bindingHandlers.formatters',
  'src/core/ko.bindingHandlers.mover',
  'src/core/ko.bindingHandlers.notice',
  'src/core/ko.bindingHandlers.value',
  'src/core/ko.bindingHandlers.spinner',
], function(
  jquery,
  ko,
  utils
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

  // clickMenu
  //---------------------------
  ko.bindingHandlers.clickMenu = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var showObservable = valueAccessor();
      if (!ko.isObservable(showObservable)) {
        throw new Error('expected an observable');
      }

      function hide() {
        showObservable(false);
      }

      function newValueAccessor() {
        return {
          click: function() {
            var show = !showObservable();
            // always unbind the hide handler
            jquery('body').off('click', hide);
            if (show) {
              // using a timeout instead of stopPropagation in order
              // to allow only one clickMenu menu to be open at a time
              setTimeout(function() {
                // hide whenever something is clicked
                jquery('body').one('click', hide);
                showObservable(show);
              }, 0);
            } else {
              showObservable(show);
            }
          },
        };
      }
      ko.bindingHandlers.event.init.call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor) {
      var show = ko.unwrap(valueAccessor()),
        menu = jquery(element).siblings('.menu');
      if (show) {
        menu.show();
      } else {
        menu.hide();
      }
    },
  };


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
        size = ensurePx(size, "");
        jquery(element).css(name, size);
      },
    };
  }
  createSizeHandler('width');
  createSizeHandler('height');

  function ensurePx(val, defaultVal) {
    if (val) {
      if (typeof(val) === 'number') {
        val = val + "px";
      }
    } else {
      val = defaultVal;
    }
    return val;
  }

  // size
  //---------------------------
  ko.bindingHandlers.position = {
    update: function(element, valueAccessor) {
      var position = ko.utils.unwrapObservable(valueAccessor()) || {};
      jquery(element).css({
        top: ensurePx(position.top, '0px'),
        left: ensurePx(position.left, '0px'),
      });
    },
  };


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
        if (utils.isFunc(element.select)) {
          element.select();
        }
        observable(false);
      }
    },
  };
  ko.bindingHandlers.clickSelect = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      function makeValueAccessor(elem) {
        return function() {
          // return events object
          return {
            click: function() {
              var range;
              if (document.selection) {
                range = document.body.createTextRange();
                range.moveToElementText(elem);
                range.select();
              } else if (window.getSelection) {
                range = document.createRange();
                range.selectNode(elem);
                window.getSelection().addRange(range);
              }
            },
          };
        };
      }
      // bind to events
      ko.bindingHandlers.event.init.call(this, element, makeValueAccessor(element), allBindingsAccessor, viewModel, bindingContext);
    },
    // update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    //   ko.bindingHandlers.event.update.call(this, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    // },
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

  // get initial value from element and set on observable
  //---------------------------
  ko.bindingHandlers.getInitValue = {
    init: function(element, valueAccessor) {
      var observable = valueAccessor();
      // set if it's an observable and doesn't have a value
      if (ko.isObservable(observable) && !observable.peek()) {
        // pass value of element to observable
        observable(jquery(element).val());
      }
    },
  };

});
