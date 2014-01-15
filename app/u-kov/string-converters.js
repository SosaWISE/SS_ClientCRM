define('src/u-kov/string-converters', [
  'src/core/strings',
  'moment'
], function(
  strings,
  moment
) {
  "use strict";

  var converters = {},
    phoneRegx = /^\(?\b([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    // these date regexps are pretty lax. they only perform part of the validation
    // the space at the end makes it so it can match dates and datetimes
    dateLongYearRegxs = [
      /^([0-9]{1,2}[- \/][0-9]{1,2}[- \/][0-9]{4} )/, // MM/DD/YYYY | MM-DD-YYYY | MM DD YYYY
      /^(\w+ [0-9]{1,2} [0-9]{4} )/, // MMM DD YYYY
      /^([0-9]{1,2} \w+ [0-9]{4} )/, // DD MMM YYYY
    ],
    dateShortYearRegxs = [
      /^([0-9]{1,2}[- \/][0-9]{1,2}[- \/])([0-9]{1,2} )/, // MM/DD/YY | MM-DD-YY | MM DD YY
      /^(\w+ [0-9]{1,2} )([0-9]{1,2} )/, // MMM DD YY
      /^([0-9]{1,2} \w+ )([0-9]{1,2} )/, // DD MMM YY
    ];

  function trim(text) {
    if (text) {
      text = (text + '').replace(/^\s+|\s+$/g, '');
    } else if (text !== '') {
      text = null;
    }
    return text;
  }


  converters.string = function() {
    return function convString(val) {
      return trim(val);
    };
  };
  converters.toUpper = function() {
    return function convString(val) {
      val = trim(val);
      if (val) {
        val = trim(val).toUpperCase();
      }
      return val;
    };
  };
  converters.bool = function() {
    return function convBool(val) {
      val = val.toLowerCase();
      return val === 'true' || val === '1';
    };
  };
  converters.number = function(precision) {
    var roundingMagnitude = Math.pow(10, precision || 0);
    return function convNumber(val) {
      if (!val) {
        return;
      }

      var num = parseFloat(val);
      if (isNaN(val) || isNaN(num)) {
        return new Error('invalid number');
      } else {
        // round to correct precision
        return Math.round(num * roundingMagnitude) / roundingMagnitude;
      }
    };
  };
  converters.date = function() {
    return function convDate(val) {
      val = trim(val);
      if (!val) {
        return;
      }

      var day;

      // add space at end to match regxs
      val += ' ';
      if (!dateLongYearRegxs.some(function(regx) {
        return regx.test(val);
      })) {
        // didn't match any of the regular expressions

        // try to fixup years
        // chrome already does this, but firefox does not
        // just trying to make them behave the same
        if (!dateShortYearRegxs.some(function(regx) {
          var matches = regx.exec(val);
          if (matches) {
            val = val.replace(regx, function(fullMatch, p1, year) {
              year = parseInt(year, 10);
              if (year < 50) {
                year += 2000;
              } else {
                year += 1900;
              }
              return p1 + year;
            });
            return true;
          }
        })) {
          // unable to fixup year
          return new Error('invalid date');
        }
      }

      // date is always UTC
      day = moment(val).utc().startOf('day');
      if (day.isValid()) {
        return day.toDate();
      } else {
        return new Error('invalid date');
      }
    };
  };
  converters.datetime = function() {
    var dateConverter = converters.date(),
      dateFormat = 'MM/DD/YYYY',
      timeFormats = [
      'hh:mm:ss.SSS A',
      'hh:mm:ss A',
      'hh:mm A'
    ];
    return function convDatetime(val) {
      val = trim(val);
      if (!val) {
        return;
      }

      var day, replacementValue;

      function replaceDate(regx) {
        val = val.replace(regx, function(fullMatch) {
          var dt = dateConverter(fullMatch);
          if (dt instanceof Date) {
            // date is UTC
            replacementValue = moment.utc(dt).format(dateFormat) + ' ';
            return replacementValue;
          } else {
            throw new Error('dt should always be a Date');
          }
        });
      }

      // add space at end to match regxs
      val += ' ';
      // parse date part the same as the date converter
      if (!dateLongYearRegxs.some(function(regx) {
        if (regx.test(val)) {
          replaceDate(regx);
          return true;
        }
      }) && !dateShortYearRegxs.some(function(regx) {
        if (regx.test(val)) {
          replaceDate(regx);
          return true;
        }
      })) {
        return new Error('invalid datetime');
      }

      // datetime is always Local
      timeFormats.some(function(timeFormat) {
        day = moment(val, dateFormat + ' ' + timeFormat);
        return day.isValid();
      });
      if (!day.isValid() && replacementValue === val) {
        // allow for only date
        day = moment(val + '12:00 am', dateFormat + ' ' + 'hh:mm A');
      }
      if (day.isValid()) {
        return day.toDate();
      } else {
        return new Error('invalid datetime');
      }
    };
  };
  converters.phone = function(outputFormat) {
    outputFormat = outputFormat || '({0}) {1}-{2}';
    return function convPhone(val) {
      val = trim(val);
      if (!val) {
        return;
      }

      var matches = phoneRegx.exec(val);
      if (!matches) {
        return new Error('Invalid phone number. Expected format: ' + strings.format(outputFormat, '123', '123', '1234'));
      } else {
        return strings.format(outputFormat, matches[1], matches[2], matches[3]);
      }
    };
  };

  return converters;
});
