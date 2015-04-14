define("src/core/numbers", [], function() {
  "use strict";

  var numbers = {
    roundTo: function(num, precision) {
      var roundingMagnitude = Math.pow(10, precision || 0);
      return Math.round(num * roundingMagnitude) / roundingMagnitude;
    },

    toOrdinal: function(num) {
      if (num < 1) {
        return num; // how to handle less than 1???
      }
      var postfix = "th",
        tens = num % 100,
        ones = num % 10;
      if (tens < 4 || (ones < 4 && 20 < tens)) {
        if (ones === 1) {
          postfix = "st";
        } else if (ones === 2) {
          postfix = "nd";
        } else if (ones === 3) {
          postfix = "rd";
        }
      }
      return num + postfix;
    },
  };

  return numbers;
});
