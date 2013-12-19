define('src/core/ko.bindingHandlers.dates', [
  'moment',
  'ko'
], function(
  moment,
  ko
) {
  "use strict";

  var outputFormat = 'MM/DD/YYYY';

  function makeFormattedDateValueAccessor(valueAccessor) {
    return function() {
      var value = ko.unwrap(valueAccessor());
      if (value instanceof Date) {
        // dates should be in UTC
        value = moment.utc(value).format(outputFormat);
      }
      return value;
    };
  }

  ko.bindingHandlers.datevalue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // pass through to `value` binding
      ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // call `value` binding with formatted date
      ko.bindingHandlers.value.update(element, makeFormattedDateValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    },
  };
  ko.bindingHandlers.datetext = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // pass through to `text` binding
      ko.bindingHandlers.text.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // call `text` binding with formatted date
      ko.bindingHandlers.text.update(element, makeFormattedDateValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    },
  };
});
