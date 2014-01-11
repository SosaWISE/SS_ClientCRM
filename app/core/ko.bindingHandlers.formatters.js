define('src/core/ko.bindingHandlers.formatters', [
  'moment',
  'ko',
  'src/core/strings',
], function(
  moment,
  ko,
  strings
) {
  "use strict";


  //
  // currency formatters
  //
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


  //
  // Date bindings
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
  // DateTime bindings
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
