define('src/knockout/ko.bindingHandlers.cmd', [
  'ko'
], function(ko) {
  "use strict";

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
        // bound to a command
        events.click = value.execute;
      } else {
        // bound to an object with commands
        // e.g.: { click: command1, change: command2 }
        Object.keys(value).forEach(function(key) {
          events[key] = value[key].execute;
        });
      }

      // bind to events
      ko.bindingHandlers.event.init(element, makeValueAccessor(events), allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value = valueAccessor(),
        canExecute;

      if (ko.isCommand(value)) {
        // bound to a command
        canExecute = value.canExecute();
      } else {
        // bound to an object with commands
        // e.g.: { click: command1, change: command2 }
        Object.keys(value).some(function(key) {
          canExecute = value[key].canExecute();
        });
      }
      // make new valueAccessor
      valueAccessor = makeValueAccessor(!canExecute);

      // toggle 'busy' class
      ko.bindingHandlers.busy.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
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
