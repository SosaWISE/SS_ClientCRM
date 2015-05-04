define("src/core/jsonhelpers", [
  "moment",
], function(
  moment
) {
  "use strict";

  var jsonhelpers,
    // starts with `Date` or ends with `On`
    isDateFieldRegx = /(On$|^Date|Date$|Time$|DOB)/,
    // ends with `JSON`
    isJSONStringRegx = /Json$/,
    // copied from RegexBuddy - XML Schema: dateTime (eg: "2010-02-08T23:32:04.187Z")
    dateTimeRegx = /-?([1-9][0-9]*)?[0-9]{4}-(1[0-2]|0[1-9])-(3[0-1]|0[1-9]|[1-2][0-9])T(2[0-3]|[0-1][0-9]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|[+-](2[0-3]|[0-1][0-9]):[0-5][0-9])?/;

  jsonhelpers = {
    replacer: function jsonReplacer(key, value) {
      // from date to timestamp
      var tmp;
      /* jshint validthis:true */
      if (isDateFieldRegx.test(key)) {
        // since the webservice wants the date string, do not do anything...
        // tmp = this[key];
        // if (tmp instanceof Date) {
        //   value = tmp.getTime();
        // }
      } else if (isJSONStringRegx.test(key)) {
        tmp = this[key];
        value = (tmp == null) ? null : jsonhelpers.stringify(tmp);
      }
      return value;
    },
    reviver: function jsonReviver(key, value) {
      // from timestamp to date
      if (isDateFieldRegx.test(key)) {
        // make sure it is a real date value. this is a problem for dates in 1970, but that should not ever happen... right?
        // this was added because there was BillingDate field added that is the day of the month (1-31).  it should be named BillingDay...
        if (typeof(value) === "number" && value > 10000000000) {
          value = new Date(value);
        } else if (typeof(value) === "string" && dateTimeRegx.test(value)) {
          // parse datetime string
          value = moment.utc(value).toDate(); // all dates from server should be UTC
        }
      } else if (isJSONStringRegx.test(key)) {
        if (typeof(value) === "string") {
          value = jsonhelpers.parse(value);
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
