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

  function makeFormattedCurrencyValueAccessor(valueAccessor, html) {
    return function() {
      var value = ko.unwrap(valueAccessor());
      value = strings.decorators.c(value);
      if (html) {
        value = value.replace(/\$/, '<b>$</b>');
      }
      return value;
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
  ko.bindingHandlers.currencyHtml = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // pass through to `html` binding
      ko.bindingHandlers.html.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // call `html` binding with formatted currency
      valueAccessor = makeFormattedCurrencyValueAccessor(valueAccessor, true);
      ko.bindingHandlers.html.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
  };
});
