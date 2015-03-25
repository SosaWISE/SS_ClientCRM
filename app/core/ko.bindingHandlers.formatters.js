define("src/core/ko.bindingHandlers.formatters", [
  "src/core/strings",
  "moment",
  "jquery",
  "ko",
], function(
  strings,
  moment,
  jquery,
  ko
) {
  "use strict";


  function createFormatter(baseName, makeFormattedValueAccessor) {
    var alwaysFormat = (baseName !== "value");
    return {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // pass through to base binding
        ko.bindingHandlers[baseName].init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
      },
      update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // only format value binding when field is not focused
        if (alwaysFormat || !jquery(element).is(":focus")) {
          // call base binding with formatted value
          valueAccessor = makeFormattedValueAccessor(valueAccessor);
        }
        ko.bindingHandlers[baseName].update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
      },
    };
  }

  //
  // currency formatters
  //
  function makeFormattedCurrencyValueAccessor(valueAccessor) {
    return function() {
      var val = ko.unwrap(valueAccessor());
      val = strings.formatters.currency(val);
      return val;
    };
  }
  ko.bindingHandlers.currencytext = createFormatter("text", makeFormattedCurrencyValueAccessor);

  function makeHtmlFormattedCurrencyValueAccessor(valueAccessor) {
    return function() {
      var val = ko.unwrap(valueAccessor());
      val = strings.formatters.currency(val);
      val = val.replace(/\$/, "<b>$</b>");
      return val;
    };
  }
  ko.bindingHandlers.currencyHtml = createFormatter("html", makeHtmlFormattedCurrencyValueAccessor);

  function makeFormattedLikeCurrencyValueAccessor(valueAccessor) {
    return function() {
      var val = ko.unwrap(valueAccessor());
      val = strings.formatters.likecurrency(val);
      return val;
    };
  }
  ko.bindingHandlers.likecurrencyvalue = createFormatter("value", makeFormattedLikeCurrencyValueAccessor);
  ko.bindingHandlers.likecurrencytext = createFormatter("text", makeFormattedLikeCurrencyValueAccessor);


  //
  // Date bindings
  //
  function makeFormattedDateValueAccessor(valueAccessor) {
    return function() {
      var val = ko.unwrap(valueAccessor());
      if (val instanceof Date) {
        val = strings.formatters.date(val);
      }
      return val;
    };
  }
  ko.bindingHandlers.datevalue = createFormatter("value", makeFormattedDateValueAccessor);
  ko.bindingHandlers.datetext = createFormatter("text", makeFormattedDateValueAccessor);


  //
  // DateTime bindings
  //
  function makeFormattedDatetimeValueAccessor(valueAccessor) {
    return function() {
      var val = ko.unwrap(valueAccessor());
      if (val instanceof Date) {
        val = strings.formatters.datetime(val);
      }
      return val;
    };
  }
  ko.bindingHandlers.datetimevalue = createFormatter("value", makeFormattedDatetimeValueAccessor);
  ko.bindingHandlers.datetimetext = createFormatter("text", makeFormattedDatetimeValueAccessor);


  //
  // Time bindings
  //
  function makeFormattedTimeValueAccessor(valueAccessor) {
    return function() {
      var val = ko.unwrap(valueAccessor());
      if (val instanceof Date) {
        val = strings.formatters.time(val);
      }
      return val;
    };
  }
  ko.bindingHandlers.timevalue = createFormatter("value", makeFormattedTimeValueAccessor);
  ko.bindingHandlers.timetext = createFormatter("text", makeFormattedTimeValueAccessor);



  //
  // Phone bindings
  //
  function makeFormattedPhoneValueAccessor(valueAccessor) {
    return function() {
      var val = ko.unwrap(valueAccessor());
      val = strings.formatters.phone(val);
      return val;
    };
  }
  ko.bindingHandlers.phonevalue = createFormatter("value", makeFormattedPhoneValueAccessor);
  ko.bindingHandlers.phonetext = createFormatter("text", makeFormattedPhoneValueAccessor);


  //
  // SSN binding
  //
  function makeSsnMaskedValueAccessor(valueAccessor) {
    return function() {
      return strings.formatters.ssnmasked(ko.unwrap(valueAccessor()));
    };
  }
  ko.bindingHandlers.ssnmasked = createFormatter("text", makeSsnMaskedValueAccessor);
  //
  function makeSsnValueAccessor(valueAccessor) {
    return function() {
      return strings.formatters.ssn(ko.unwrap(valueAccessor()));
    };
  }
  ko.bindingHandlers.ssnvalue = createFormatter("value", makeSsnValueAccessor);


  //
  // Feet binding
  //
  function makeFeetValueAccessor(valueAccessor) {
    return function() {
      return strings.formatters.feet(ko.unwrap(valueAccessor()));
    };
  }
  ko.bindingHandlers.feet = createFormatter("text", makeFeetValueAccessor);
  ko.bindingHandlers.feetvalue = createFormatter("value", makeFeetValueAccessor);


});
