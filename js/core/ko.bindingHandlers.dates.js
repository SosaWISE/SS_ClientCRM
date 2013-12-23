define('src/core/ko.bindingHandlers.dates', [
  'moment',
  'ko'
], function(
  moment,
  ko
) {
  "use strict";

  //
  // Date
  //
  function makeFormattedDateValueAccessor(valueAccessor) {
    return function() {
      var value = ko.unwrap(valueAccessor());
      if (value instanceof Date) {
        // dates should be in UTC
        value = moment.utc(value).format('MM/DD/YYYY');
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
      valueAccessor = makeFormattedDateValueAccessor(valueAccessor);
      ko.bindingHandlers.value.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
  };
  ko.bindingHandlers.datetext = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // pass through to `text` binding
      ko.bindingHandlers.text.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // call `text` binding with formatted date
      valueAccessor = makeFormattedDateValueAccessor(valueAccessor);
      ko.bindingHandlers.text.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
  };


  //
  // DateTime
  //
  function makeFormattedDatetimeValueAccessor(valueAccessor) {
    return function() {
      var value = ko.unwrap(valueAccessor());
      if (value instanceof Date) {
        // datetime should be Local
        value = moment(value).format('MM/DD/YYYY hh:mm:ss.SSS A');
      }
      return value;
    };
  }
  ko.bindingHandlers.datetimevalue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // pass through to `value` binding
      ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // call `value` binding with formatted date
      valueAccessor = makeFormattedDatetimeValueAccessor(valueAccessor);
      ko.bindingHandlers.value.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
  };
  ko.bindingHandlers.datetimetext = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // pass through to `text` binding
      ko.bindingHandlers.text.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // call `text` binding with formatted date
      valueAccessor = makeFormattedDatetimeValueAccessor(valueAccessor);
      ko.bindingHandlers.text.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
  };
});
