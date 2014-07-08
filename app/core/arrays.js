define('src/core/arrays', [
  'ko',
], function(
  ko
) {
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

    // assumes `list` is already ordered
    insertOrdered: function(list, comparer, item) {
      var peekList = ko.isObservable(list) ? list.peek() : list;
      if (!peekList.some(function(obj, index) {
        if (comparer(obj, item) > 0) {
          // insert into list
          list.splice(index, 0, item);
          return true;
        }
      })) {
        // put at end of list
        list.push(item);
      }
    },

  };
});
