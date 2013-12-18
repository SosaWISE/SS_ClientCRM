define('src/core/strings', [
  'src/core/arrays',
], function(
  arrays
) {
  "use strict";

  var strings = {},
    formatRegex = /\{([0-9]+)(?::([0-9A-Z]+))?\}/gi, // {0} or {0:decoratorName}
    usdFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

  // e.g.: strings.format('{0} {1}', 'bob', 'bobbins') === 'bob bobbins'
  strings.format = function(format /*, ...args*/ ) {
    // over 1 million iterations
    // (~2460ms) time without either (one-based indexes)
    // (~3505ms) making arguments into an array using slice.call adds about 43% to the total time (zero-based)
    // (~2675ms) parsing the int and adding 1 adds about 9% to the total time (zero-based)
    //           -with larger integers, say the number 2000, this method gets slower (~3070ms, still faster than slice.call),
    //            but the integers should be at most double digits
    //           -actually, with larger numbers this one is the fastest. i think manually making an array is slower
    //            only because of a failed lookup for the key '2000', but in reality there shouldn't that many args
    // (~2590ms) manually making arguments into an array adds about 5% to the total time (slice.call(arguments, 1)) (zero-based)
    //           -with more arguments, this would also get slower, but, again, there shouldn't be very many args

    // since we want zero-based indexes and speed we'll choose the last one
    return strings.aformat(format, arrays.argsToArray(arguments, 1));
  };
  strings.aformat = function(format, argsArray, missingParamText) {
    var decorators = strings.decorators;
    format = format || '';
    missingParamText = missingParamText || '';
    return format.replace(formatRegex, function(item, paramIndex, formatName) {
      formatName = formatName;
      var val = argsArray[paramIndex];
      if (val != null) {
        if (formatName && typeof(decorators[formatName]) === 'function') {
          return decorators[formatName](val);
        } else {
          return val;
        }
      } else {
        return missingParamText;
      }
    });
  };

  strings.decorators = {
    c: function(val) {
      return usdFormatter.format(val);
    },
    space: function(val) {
      val = val || '';
      return val.split('').join('&nbsp;');
    },
  };

  strings.trim = function(text) {
    if (text) {
      text = (text + '').replace(/^\s+|\s+$/g, '');
    } else if (text !== '') {
      text = null;
    }
    return text;
  };

  // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  strings.escapeRegExp = function(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  };
  // escapeRegExp: function(text) {
  //   return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  // },
  // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
  // function escapeRegExp(str) {
  //   return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  // }

  return strings;
});
