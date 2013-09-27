define([], function() {
  "use strict";

  var converters = {};

  converters.string = function() {
    return function convString(val) {
      return trim(val);
    };
  };

  function trim(text) {
    if (text) {
      text = (text + '').replace(/^\s+|\s+$/g, '');
    } else {
      text = '';
    }
    return text;
  }

  converters.bool = function() {
    return function convBool(val) {
      val = val.toLowerCase();
      return val === 'true' || val === '1';
    };
  };
  converters.number = function(precision) {
    var roundingMagnitude = Math.pow(10, precision || 0);
    return function convNumber(val) {
      if (!val) {
        return;
      }

      var num = parseFloat(val);
      if (isNaN(val) || isNaN(num)) {
        return new Error('invalid number');
      } else {
        // round to correct precision
        return Math.round(num * roundingMagnitude) / roundingMagnitude;
      }
    };
  };
  converters.date = function() {
    /* jshint unused:false */
    return function convDate(val) {
      throw new Error('not implemented');
    };
  };

  converters.phone = function() {
    return function convPhone(val) {
      var matches = /^\(?\b([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.exec(val);
      if (!matches) {
        return new Error('invalid phone number. expected pattern: 123.123.1234');
      } else {
        return [matches[1], matches[2], matches[3]].join('.');
      }
    };
  };

  return converters;
});
