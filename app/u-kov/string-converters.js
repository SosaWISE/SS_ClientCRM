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
    ssnRegx = /^(\d{3})(\d{2})(\d{4})$/;

  converters.string = function() {
    return convString;
  };
  converters.nullString = function() {
    return convNullString;
  };
  converters.toUpper = function() {
    return convToUpper;
  };
  converters.bool = function() {
    return convBool;
  };
  converters.numText = function(errMsg) {
    errMsg = errMsg || 'invalid number';
    return function convNumText(val) {
      val = trim(val);
      if (!val) {
        return;
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
        return;
      }

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
        return null;
      }

      var matches = phoneRegx.exec(val);
      if (!matches) {
        return new Error('Invalid phone number. Expected format: ' + strings.format(outputFormat, '123', '123', '1234'));
      } else {
        return strings.format(outputFormat, matches[1], matches[2], matches[3]);
      }
    };
  };
  converters.ccard = function() {
    return function convCCard(val) {
      val = trim(val);
      if (!val) {
        return;
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
    return val;
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
    val = val.replace(/[^0-9]/g, '');

    // try to match
    var matches = ssnRegx.exec(val);
    if (matches) {
      return strings.format('{0}-{1}-{2}', matches[1], matches[2], matches[3]);
    } else {
      return new Error('Invalid Social Security Number. Expected format: 123-12-1234');
    }
  }

  return converters;
});
