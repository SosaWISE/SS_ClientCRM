define('src/core/jsonhelpers', [], function() {
  "use strict";

  var isDateFieldRegex = /On$/,
    jsonhelpers;
  jsonhelpers = {
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

    stringify: function(obj, space) {
      return JSON.stringify(obj, jsonhelpers.replacer, space);
    },
    parse: function(str) {
      return JSON.parse(str, jsonhelpers.reviver);
    },
  };
  return jsonhelpers;
});
