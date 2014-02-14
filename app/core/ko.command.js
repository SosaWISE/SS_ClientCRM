define('src/core/ko.command', [
  'ko',
  'src/core/utils',
], function(
  ko,
  utils
) {
  "use strict";

  //
  // extend ko with command
  //

  ko.isCommand = function(obj) {
    return obj && utils.isFunc(obj.execute);
  };
  ko.command = function(execute, canExecute) {
    var _cmd = ko.observable(),
      canExecuteWrapper;

    _cmd.busy = ko.observable();

    function onComplete() {
      _cmd.busy(false);
    }
    _cmd.execute = function(cb) {
      if (!_cmd.canExecute.peek()) {
        if (utils.isFunc(cb)) {
          cb();
        }
        return;
      }
      _cmd.busy(true);
      return execute.call(this, function() {
        onComplete();
        if (utils.isFunc(cb)) {
          cb.apply(null, ko.utils.makeArray(arguments));
        }
      });
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
      read: canExecuteWrapper,
      write: canExecuteWrapper, // ignores passed in value, basically forces a recompute
    });
    _cmd.recompute = function() {
      _cmd.canExecute(1);
    };

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
      } else if (utils.isFunc(value)) {
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
      } else if (utils.isFunc(value)) {
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
});
