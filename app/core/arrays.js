define('src/core/arrays', [
], function() {
  "use strict";

  return {

    argsToArray: function(args, fromStart, fromEnd) {
      fromStart = fromStart || 0;
      var i = 0,
        length = (args.length - fromStart) - (fromEnd || 0),
        array = new Array(length);
      while (i < length) {
        array[i] = args[i + fromStart];
        i++;
      }
      return array;
    },

  };
});
