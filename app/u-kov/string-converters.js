define('src/u-kov/string-converters', [
  'src/core/jsonhelpers',
  'src/core/paymenthelper',
  'src/core/strings',
  'moment'
], function(
  jsonhelpers,
  paymenthelper,
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
    ],
    allDigitsRegx = /^[0-9]+$/,
    removeNonDigitsRegx = /[^0-9]/g;

  converters.string = function() {
    return convString;
  };
  converters.nullString = function() {
    return convNullString;
  };
  converters.toUpper = function() {
    return convToUpper;
  };
  converters.toLower = function() {
    return convToLower;
  };
  converters.bool = function() {
    return convBool;
  };
  converters.numText = function(errMsg) {
    errMsg = errMsg || 'invalid number';
    return function convNumText(val) {
      val = trim(val);
      if (!val) {
        return null;
      }

      // return val.replace(/[^\d]/g, '');
      if (/^[\d]+$/.test(val)) {
        return val;
      } else {
        return new Error(errMsg);
      }
    };
  };
  converters.jsonString = function() {
    return convJsonString;
  };

  converters.number = function(precision, errMsg) {
    errMsg = errMsg || 'invalid number';
    var roundingMagnitude = Math.pow(10, precision || 0);
    return function convNumber(val) {
      if (!val) {
        return null;
      }

      // remove non-number characters
      // (- and . are needed for negative and decimals. more than one or wrong position will make val NaN)
      val = val.replace(/[^-.0-9]/g, '');

      var num = parseFloat(val);
      if (isNaN(val) || isNaN(num)) {
        return new Error(errMsg);
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
        return null;
      }

      var day;

      if ((val.length === 6 || val.length === 8) && allDigitsRegx.test(val)) {
        // convert number string to date
        // e.g.: 050614 -> 05/06/14
        // e.g.: 05062014 -> 05/06/2014
        val = strings.format('{0}/{1}/{2}', val.substr(0, 2), val.substr(2, 2), val.substr(4));
      }

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
        return null;
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
  converters.phone = function() {
    return function convPhone(val) {
      val = trim(val);
      if (!val) {
        return null;
      }

      var matches = phoneRegx.exec(val);
      if (matches) {
        return matches[1] + matches[2] + matches[3];
      } else {
        return new Error('Invalid phone number. Expected format: (123) 123-1234');
      }
    };
  };
  converters.ccard = function() {
    return function convCCard(val) {
      val = trim(val);
      if (!val) {
        return null;
      }

      val = val.replace(/[^\d]/g, '');
      if (13 < val.length && val.length < 17 && paymenthelper.luhnTest(val)) {
        return val;
      } else {
        return new Error('Invalid number text');
      }
    };
  };
  converters.ssn = function() {
    return convSsn;
  };


  function trim(text) {
    if (text) {
      text = (text + '').replace(/^\s+|\s+$/g, '');
    } else if (text !== '') {
      text = null;
    }
    return text;
  }

  function convString(val) {
    return trim(val);
  }

  function convNullString(val) {
    return trim(val) || null;
  }

  function convToUpper(val) {
    val = trim(val);
    if (val) {
      val = val.toUpperCase();
    }
    return val || null;
  }

  function convToLower(val) {
    val = trim(val);
    if (val) {
      val = val.toLowerCase();
    }
    return val || null;
  }

  function convBool(val) {
    val = val.toLowerCase();
    return val === 'true' || val === '1';
  }

  function convJsonString(val) {
    val = trim(val);
    if (!val) {
      return null;
    }

    try {
      return jsonhelpers.stringify(jsonhelpers.parse(val), 2);
    } catch (ex) {
      return ex;
    }
  }

  function convSsn(val) {
    val = trim(val);
    if (!val) {
      return null;
    }
    // remove everything but digits
    val = val.replace(removeNonDigitsRegx, '');
    // try to match
    if (val.length === 9) {
      return val;
    } else {
      return new Error('Invalid Social Security Number. Expected format: 123-12-1234');
    }
  }

  return converters;
});
