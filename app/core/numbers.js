define('src/core/numbers', [], function() {
  "use strict";

  var numbers = {};

  numbers.roundTo = function(num, precision) {
    var roundingMagnitude = Math.pow(10, precision || 0);
    return Math.round(num * roundingMagnitude) / roundingMagnitude;
  };

  return numbers;
});
