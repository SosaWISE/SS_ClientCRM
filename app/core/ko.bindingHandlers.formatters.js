define('src/core/ko.bindingHandlers.formatters', [
  'moment',
  'ko',
  'src/core/strings',
  // include other formatter binding handlers
  'src/core/ko.bindingHandlers.dates',
], function(
  moment,
  ko,
  strings
) {
  "use strict";

  function makeFormattedCurrencyValueAccessor(valueAccessor) {
    return function() {
      var value = ko.unwrap(valueAccessor());
      return strings.decorators.c(value);
    };
  }

  ko.bindingHandlers.currency = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // pass through to `text` binding
      ko.bindingHandlers.text.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // call `text` binding with formatted currency
      valueAccessor = makeFormattedCurrencyValueAccessor(valueAccessor);
      ko.bindingHandlers.text.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
  };
});
