define('src/core/jsonhelpers', [
  'moment',
], function(
  moment
) {
  "use strict";

  var jsonhelpers,
    // starts with `Date` or ends with `On`
    isDateFieldRegex = /(On$|^Date|Date$|DateTime$|DOB)/,
    // copied from RegexBuddy - XML Schema: dateTime (eg: "2010-02-08T23:32:04.187Z")
    dateTimeRegx = /-?([1-9][0-9]*)?[0-9]{4}-(1[0-2]|0[1-9])-(3[0-1]|0[1-9]|[1-2][0-9])T(2[0-3]|[0-1][0-9]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|[+-](2[0-3]|[0-1][0-9]):[0-5][0-9])?/;

  jsonhelpers = {
    replacer: function jsonReplacer(key, value) {
      // from date to timestamp
      var dt;
      /* jshint validthis:true */
      if (isDateFieldRegex.test(key)) {
        if ((dt = this[key]) instanceof Date) {
          value = dt.getTime();
        }
      }
      return value;
    },
    reviver: function jsonReviver(key, value) {
      // from timestamp to date
      if (isDateFieldRegex.test(key)) {
        if (typeof(value) === 'number') {
          value = new Date(value);
        } else if (typeof(value) === 'string' && dateTimeRegx.test(value)) {
          // parse datetime string
          value = moment(value).toDate();
        }
      }
      return value;
    },

    stringify: function(obj, space) {
      return JSON.stringify(obj, jsonhelpers.replacer, space);
      // return JSON.stringify(obj, null, space);
    },
    parse: function(str) {
      return JSON.parse(str, jsonhelpers.reviver);
    },
  };
  return jsonhelpers;
});
