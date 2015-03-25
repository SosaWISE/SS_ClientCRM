define("src/core/ko.command", [
  "jquery",
  "ko",
  "src/core/notify",
  "src/core/utils",
], function(
  jquery,
  ko,
  notify,
  utils
) {
  "use strict";

  //
  // extend ko with command
  //

  ko.isCommand = function(obj) {
    return obj && utils.isFunc(obj.execute) && ko.isObservable(obj.canExecute);
  };
  ko.command = function(execute, canExecute, extensions) {
    var _cmd = ko.observable(),
      canExecuteWrapper;

    _cmd.toggle = null;
    if (extensions && utils.isObject(extensions)) {
      if (extensions.toggle) {
        if (!isToggle(extensions.toggle)) {
          throw new Error("invalid toggle command extension");
        }
        _cmd.toggle = extensions.toggle;
        _cmd.toggle.text = ko.computed(function() {
          return (_cmd.toggle.isDown() ? _cmd.toggle.down : _cmd.toggle.up).text;
        });
        _cmd.toggle.title = ko.computed(function() {
          return (_cmd.toggle.isDown() ? _cmd.toggle.down : _cmd.toggle.up).title;
        });
      }
    }
    _cmd.busy = ko.observable();

    _cmd.execute = function(cb) {
      if (!_cmd.canExecute.peek()) {
        if (utils.isFunc(cb)) {
          cb();
        }
        return;
      }
      _cmd.busy(true);
      var called = false;
      try {
        return execute.call(this, function(err) {
          if (called) {
            return;
          }
          called = true;

          // show error if there is one
          if (err && err.Code != null) {
            notify.error(err);
          }

          _cmd.busy(false);
          if (utils.isFunc(cb)) {
            cb.apply(null, ko.utils.makeArray(arguments));
          }
        }, this, ko.utils.makeArray(arguments)); // pass view model as second argument and arguments as the third
      } catch (ex) {
        called = true;
        _cmd.busy(false);
        if (utils.isFunc(cb)) {
          cb();
        }
        throw ex;
      }
    };

    if (canExecute) {
      canExecuteWrapper = function() {
        return canExecute(_cmd.busy());
      };
    } else {
      canExecuteWrapper = function() {
        return !_cmd.busy();
      };
    }
    _cmd.canExecute = ko.computed({
      deferEvaluation: true,
      read: canExecuteWrapper,
      write: canExecuteWrapper, // ignores passed in value, basically forces a recompute
    });
    _cmd.recompute = function() {
      _cmd.canExecute(1);
    };

    return _cmd;
  };

  function isToggle(toggle) {
    return toggle && ko.isObservable(toggle.isDown) &&
      toggle.up && utils.isObject(toggle.up) &&
      toggle.down && utils.isObject(toggle.down);
  }

  // function isToggleCommand(value) {
  //   return ko.isCommand(value) && isToggle(value.toggle);
  // }


  //
  // binding handler for command
  //
  function makeValueAccessor(value) {
    return function() {
      return value;
    };
  }
  ko.bindingHandlers.cmd = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value = valueAccessor(),
        events = {};

      if (!ko.isCommand(value) && !utils.isFunc(value)) {
        console.warn("value is not a command or a function:", value);
        return;
      }

      var fn = ko.isCommand(value) ? value.execute : value;
      events.click = fn;
      events.keyup = function(vm, evt) {
        switch (evt.keyCode) {
          case 13: // enter
          case 32: // space
            // call function
            fn.call(this, vm, evt);
            break;
        }
      };

      // bind to events
      ko.bindingHandlers.event.init.call(this, element, makeValueAccessor(events), allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value = valueAccessor(),
        canExecute, busy;

      if (!ko.isCommand(value) && !utils.isFunc(value)) {
        console.warn("value is not a command or a function:", value);
        return;
      }

      if (ko.isCommand(value)) {
        canExecute = value.canExecute();
        busy = value.busy();
      } else {
        canExecute = true;
        busy = false;
      }

      // make new valueAccessor
      valueAccessor = makeValueAccessor(!canExecute);

      // toggle "busy" class
      ko.bindingHandlers.busy.update(element, makeValueAccessor(busy), allBindingsAccessor, viewModel, bindingContext);
      // toggle "disabled" class
      ko.bindingHandlers.cssDisabled.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

      if (allBindingsAccessor().cmdNoDisabledAttr) {
        return;
      }
      // and set disabled attribute
      ko.bindingHandlers.disable.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
      // for non input elements we need to manually set disabled to false
      if (canExecute && element.disabled) {
        element.disabled = false;
      }
    }
  };
  ko.bindingHandlers.cmdEnter = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value = valueAccessor(),
        events = {};

      if (!ko.isCommand(value) && !utils.isFunc(value)) {
        console.warn("value is not a command or a function:", value);
        return;
      }

      var fn = ko.isCommand(value) ? value.execute : value;
      events.keyup = function(vm, evt) {
        switch (evt.keyCode) {
          case 13: // enter
            // call function
            fn.call(this, vm, evt);
            break;
        }
      };

      // bind to events
      ko.bindingHandlers.event.init.call(this, element, makeValueAccessor(events), allBindingsAccessor, viewModel, bindingContext);
    },
    update: ko.bindingHandlers.cmd.update,
  };

  ko.bindingHandlers.tcmd = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var tcmd = valueAccessor();

      if (!ko.isCommand(tcmd) || !tcmd.toggle) {
        console.warn("value is not a toggle command:", tcmd);
        return;
      }

      // call base
      ko.bindingHandlers.cmd.init.call(this, element, makeValueAccessor(tcmd), allBindingsAccessor, viewModel, bindingContext);

      // tell ko to not data-bind descendant nodes (more info in ko.bindingHandlers['text']
      return {
        "controlsDescendantBindings": true,
      };
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var tcmd = valueAccessor();

      if (!ko.isCommand(tcmd) || !tcmd.toggle) {
        console.warn("value is not a toggle command:", tcmd);
        return;
      }
      var toggle = tcmd.toggle;
      var isDown = toggle.isDown();
      // change text
      ko.utils.setTextContent(element, toggle.text.peek());
      // change title
      element.setAttribute("title", toggle.title.peek());
      // toggle class
      var el = jquery(element);
      if (isDown) {
        el.removeClass(toggle.up.cls);
        el.addClass(toggle.down.cls);
      } else {
        el.removeClass(toggle.down.cls);
        el.addClass(toggle.up.cls);
      }

      // call base
      ko.bindingHandlers.cmd.update.call(this, element, makeValueAccessor(tcmd), allBindingsAccessor, viewModel, bindingContext);
    }
  };
});
