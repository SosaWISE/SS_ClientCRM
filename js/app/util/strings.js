define([
  'utils',
], function(
  utils
) {
  "use strict";

  var strings = {},
    formatRegex = /\{([0-9]+)\}/g;

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
    return strings.aformat(format, utils.argsToArray(arguments, 1));
  };
  strings.aformat = function(format, argsArray) {
    return (format || '').replace(formatRegex, function(item, match) {
      var val = argsArray[match];
      if (val != null) {
        return val;
      } else {
        return "";
      }
    });
  };

  return strings;
});
