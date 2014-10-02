define('src/core/strings', [
  'moment',
  'src/core/numbers',
  'src/core/arrays',
  'src/core/utils',
], function(
  moment,
  numbers,
  arrays,
  utils
) {
  'use strict';

  var strings = {},
    formatRegex = /\{([0-9]+)(?::([0-9A-Z$]+))?\}/gi, // {0} or {0:decoratorName}
    phoneRegx = /^\(?\b([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    usdFormatter;

  // e.g.: strings.format('{0} {1}', 'bob', 'bobbins') === 'bob bobbins'
  strings.format = function(format /*, ...args*/ ) {
    // over 1 million iterations
    // (~2460ms) time without either (one-based indexes)
    // (~3505ms) making arguments into an array using slice.call adds about 43% to the total time (zero-based)
    // (~2675ms) parsing the int and adding 1 adds about 9% to the total time (zero-based)
    //           -with larger integers, say the number 2000, this method gets slower (~3070ms, still faster than slice.call),
    //            but the integers should be at most double digits
    //           -actually, with larger numbers this one is the fastest. i think manually making an array is slower
    //            only because of a failed lookup for the key '2000', but in reality there shouldn't that many args
    // (~2590ms) manually making arguments into an array adds about 5% to the total time (slice.call(arguments, 1)) (zero-based)
    //           -with more arguments, this would also get slower, but, again, there shouldn't be very many args

    // since we want zero-based indexes and speed we'll choose the last one
    return strings.aformat(format, arrays.argsToArray(arguments, 1));
  };
  strings.aformat = function(format, argsArray, missingParamFormat) {
    var decorators = strings.decorators;
    format = format || '';
    missingParamFormat = missingParamFormat || '';
    return format.replace(formatRegex, function(item, paramIndex, formatName) {
      formatName = formatName;
      var val = argsArray[paramIndex];
      if (val != null) {
        if (formatName && utils.isFunc(decorators[formatName])) {
          return decorators[formatName](val);
        } else {
          return val;
        }
      } else {
        return strings.aformat(missingParamFormat, [paramIndex]);
      }
    });
  };

  strings.formatters = {
    currency: function(val) {
      if (!usdFormatter) {
        if (window.Intl) {
          usdFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          });
        } else {
          //@TODO: replace this fake usdFormatter
          usdFormatter = {
            format: function(v) {
              return '$' + v;
            },
          };
        }
      }
      return usdFormatter.format(val);
    },
    likecurrency: function(val) {
      return strings.formatters.currency(val).replace('$', '');
    },
    date: function(dt, isLocal) {
      // UTC by default ???
      if (isLocal) {
        dt = moment(dt);
      } else {
        dt = moment.utc(dt);
      }
      return dt.format('MM/DD/YYYY');
    },
    datetime: function(dt, isUtc) {
      // Local by default ???
      //@REVEIW: the web server should always return UTC dates, so i don't know about this default...
      //to allow display of nullable dates
      if (dt === null || dt === '') {
        return '';
      }
      if (isUtc) {
        dt = moment.utc(dt);
      } else {
        dt = moment(dt);
      }
      return dt.format('MM/DD/YYYY hh:mm a');
    },
    phone: function(val, outputFormat) {
      if (!val) {
        return val;
      }
      var matches = phoneRegx.exec(val);
      if (!matches) {
        return val;
      } else {
        return strings.format(outputFormat || '({0}) {1}-{2}', matches[1], matches[2], matches[3]);
      }
    },
  };
  strings.decorators = {
    // wrap formatters in case they are modified outside of this file
    c: function(val) {
      return strings.formatters.currency(val);
    },
    d: function(val) {
      return strings.formatters.date(val);
    },
    dt: function(val) {
      return strings.formatters.datetime(val);
    },
    space: function(val) {
      val = (val || '') + ''; // make sure it's not null, undefined, or something other than a string
      return val.split('').join('&nbsp;');
    },
    phone: function(val) {
      return strings.formatters.phone(val);
    },
    ordinal: function(val) {
      var integer = parseInt(val, 10);
      /* jshint eqeqeq:false */
      if (integer == val) {
        return numbers.toOrdinal(integer);
      } else {
        return val;
      }
    }
  };
  // aliases
  strings.decorators.$ = strings.decorators.c;
  strings.decorators.th = strings.decorators.ordinal;

  strings.trim = function(text) {
    if (text) {
      text = (text + '').replace(/^\s+|\s+$/g, '');
    } else if (text !== '') {
      text = null;
    }
    return text;
  };
  strings.joinTrimmed = function(joinOn, args /*...*/ ) {
    var list = [];
    // args is an array or everything after joinOn becomes and array
    if (!Array.isArray(args)) {
      args = arrays.argsToArray(arguments, 1);
    }
    // only include truthy args
    args.forEach(function(val) {
      val = strings.trim(val);
      if (val) {
        list.push(val);
      }
    });
    return list.join(joinOn);
  };

  // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  strings.escapeRegExp = function(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  };
  // escapeRegExp: function(text) {
  //   return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  // },
  // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
  // function escapeRegExp(str) {
  //   return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  // }


  function pad(isLeft, txt, letter, minLength) {
    if (!txt && txt !== 0) {
      txt = '';
    }
    txt += '';
    if (isLeft) {
      while (txt.length < minLength) {
        txt = letter + txt;
      }
    } else {
      while (txt.length < minLength) {
        txt += letter;
      }
    }
    return txt;
  }
  strings.padLeft = function(txt, letter, minLength) {
    return pad(true, txt, letter, minLength);
  };
  strings.padRight = function(txt, letter, minLength) {
    return pad(false, txt, letter, minLength);
  };


  function strWithTest(str, val, atStart) {
    str = (str == null) ? '' : ('' + str);
    val = (val == null) ? '' : ('' + val);
    return str.length >= val.length &&
      (atStart ? str.slice(0, val.length) : str.slice(str.length - val.length)) === val;
  }
  strings.startsWith = function(str, val) {
    return strWithTest(str, val, true);
  };
  strings.endsWith = function(str, val) {
    return strWithTest(str, val, false);
  };

  strings.repeat = function(text, num) {
    return new Array(num + 1).join(text);
  };

  // Random text that excludes chars that look similar such as 1liO0o
  var passwordChars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
  strings.randomPassword = function(length) {
    var rayLength = passwordChars.length,
      ray = new Array(length),
      i = length;
    while (0 < i--) {
      ray[i] = passwordChars[Math.round(Math.random() * rayLength)];
    }
    return ray.join('');
  };

  return strings;
});
