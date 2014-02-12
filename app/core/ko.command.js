define('src/core/ko.command', [
  'ko'
], function(ko) {
  "use strict";

  //
  // extend ko with command
  //

  ko.isCommand = function(obj) {
    return obj && typeof(obj.execute) === 'function';
  };
  ko.command = function(execute, canExecute) {
    var _cmd = ko.observable(),
      can;

    _cmd.busy = ko.observable();

    function onComplete() {
      _cmd.busy(false);
    }
    _cmd.execute = function(cb) {
      if (!can) {
        if (typeof(cb) === 'function') {
          cb();
        }
        return;
      }
      _cmd.busy(true);
      return execute.call(this, function() {
        onComplete();
        if (typeof(cb) === 'function') {
          cb.apply(null, ko.utils.makeArray(arguments));
        }
      });
    };

    if (canExecute) {
      _cmd.canExecute = ko.computed(function() {
        can = canExecute(_cmd.busy());
        return can;
      });
    } else {
      _cmd.canExecute = ko.computed(function() {
        can = !_cmd.busy();
        return can;
      });
    }

    return _cmd;
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

      if (ko.isCommand(value)) {
        events.click = value.execute;
      } else if (typeof(value) === 'function') {
        events.click = value;
      } else {
        console.log('value is not a command or a function', value);
        return;
      }

      events.keyup = function(vm, evt) {
        switch (evt.keyCode) {
          case 13: // enter
          case 32: // space
            // call click function
            events.click.apply(this, arguments);
            break;
        }
      };

      // bind to events
      ko.bindingHandlers.event.init.call(this, element, makeValueAccessor(events), allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value = valueAccessor(),
        canExecute, busy;

      if (ko.isCommand(value)) {
        canExecute = value.canExecute();
        busy = value.busy();
      } else if (typeof(value) === 'function') {
        canExecute = true;
        busy = false;
      } else {
        console.log('value is not a command or a function', value);
        return;
      }

      // make new valueAccessor
      valueAccessor = makeValueAccessor(!canExecute);

      // toggle 'busy' class
      ko.bindingHandlers.busy.update(element, makeValueAccessor(busy), allBindingsAccessor, viewModel, bindingContext);
      // toggle 'disabled' class
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

      if (ko.isCommand(value)) {
        value = value.execute;
      } else if (typeof(value) === 'function') {
        value = value;
      } else {
        console.log('value is not a command or a function', value);
        return;
      }

      events.keyup = function(vm, evt) {
        switch (evt.keyCode) {
          case 13: // enter
            // call click function
            value.apply(this, arguments);
            break;
        }
      };

      // bind to events
      ko.bindingHandlers.event.init.call(this, element, makeValueAccessor(events), allBindingsAccessor, viewModel, bindingContext);
    },
    update: ko.bindingHandlers.cmd.update,
  };
});
