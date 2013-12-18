define('src/core/ko.bindingHandlers.cmd', [
  'jquery',
  'ko'
], function(
  jquery,
  ko
) {
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
});
