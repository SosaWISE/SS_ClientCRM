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

  function Command(execute, canExecute, extensions) {
    var _this = this;
    _this._execute = execute;

    if (extensions && utils.isObject(extensions)) {
      if (extensions.toggle) {
        if (!isToggle(extensions.toggle)) {
          throw new Error("invalid toggle command extension");
        }
        _this.toggle = extensions.toggle;
        _this.toggle.text = ko.computed(function() {
          return (_this.toggle.isDown() ? _this.toggle.down : _this.toggle.up).text;
        });
        _this.toggle.title = ko.computed(function() {
          return (_this.toggle.isDown() ? _this.toggle.down : _this.toggle.up).title;
        });
      }
    }
    _this.busy = ko.observable();

    _this.execute = function(cb) {
      if (!_this.canExecute.peek()) {
        if (utils.isFunc(cb)) {
          cb();
        }
        return;
      }
      _this.busy(true);
      var ctx = {
        called: false,
      };
      try {
        return _this._execute.call(this, function(err) {
          if (ctx.called) {
            return;
          }
          ctx.called = true;

          // show error if there is one
          if (err && err.Code != null) {
            notify.error(err);
          }

          _this.busy(false);
          if (utils.isFunc(cb)) {
            cb.apply(null, ko.utils.makeArray(arguments));
          }
        }, this, ko.utils.makeArray(arguments)); // pass view model as second argument and arguments as the third

      } catch (ex) {
        ctx.called = true;
        _this.busy(false);
        if (utils.isFunc(cb)) {
          cb();
        }
        throw ex;
      }
    };

    var canExecuteWrapper = canExecute ?
      function() {
        return canExecute(_this.busy());
      } :
      function() {
        return !_this.busy();
      };
    _this.canExecute = ko.computed({
      deferEvaluation: true,
      read: canExecuteWrapper,
      write: canExecuteWrapper, // ignores passed in value, basically forces a recompute
    });
    _this.recompute = function() {
      _this.canExecute(1);
    };
  }
  Command.prototype.toggle = null;

  // Command.prototype.onExecute = function(ctx, cb) {
  //   var _this = this;
  // };

  function isToggle(toggle) {
    return toggle && ko.isObservable(toggle.isDown) &&
      toggle.up && utils.isObject(toggle.up) &&
      toggle.down && utils.isObject(toggle.down);
  }
  // function isToggleCommand(value) {
  //   return ko.isCommand(value) && isToggle(value.toggle);
  // }

  //
  // extend ko with command
  //

  ko.isCommand = function(obj) {
    return obj instanceof Command;
  };
  ko.command = function(execute, canExecute, extensions) {
    return new Command(execute, canExecute, extensions);
  };

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
