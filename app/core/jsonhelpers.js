define('src/core/jsonhelpers', [], function() {
  "use strict";

  var isDateFieldRegex = /On$/;
  return {
    replacer: function jsonReplacer(key, value) {
      // from date to timestamp
      var dt;
      /* jshint validthis:true */
      if (isDateFieldRegex.test(key) && (dt = this[key]) instanceof Date) {
        value = dt.getTime();
      }
      return value;
    },
    reviver: function jsonReviver(key, value) {
      // from timestamp to date
      if (isDateFieldRegex.test(key) && typeof(value) === 'number') {
        value = new Date(value);
      }
      return value;
    },
  };
});
