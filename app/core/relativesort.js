define('src/core/relativesort', [], function() {
  "use strict";

  var min = (Math.pow(2, 31) * -1), // min int
    max = (Math.pow(2, 31) - 1); // max int

  function RelativeSort(options) {
    var _this = this;
    options = options || {};
    _this.zero = options.zero || 0; // from where we start counting
    if (options.increment) {
      _this.increment = options.increment;
    } else {
      options.maxItems = options.maxItems || (1 << 14); // default to 16384 items
      // calculate increment using min, max and maxItems
      _this.increment = Math.floor(((max - min) / 2) / options.maxItems);
    }
  }

  RelativeSort.prototype.getIntSort = function(up, down) {
    var _this = this,
      result = getIntSort(up, down, _this.increment, _this.zero);
    if (result > max) {
      console.warn('`result` is greater than ' + max + '. truncating.');
      result = max;
    }
    if (result < min) {
      console.warn('`result` is less than ' + min + '. truncating.');
      result = min;
    }
    console.log('up:', up, 'down:', down, 'result:', result);
    return result;
  };

  function getIntSort(up, down, increment, zero) {
    var result;
    if (typeof(up) === 'number' && typeof(down) === 'number') {
      if (up > down) {
        // swap values
        result = up;
        up = down;
        down = result;
      }
      if (up === down) {
        result = up;
      } else {
        result = up + Math.floor((down - up) / 2);
      }
      if (result < up) {
        console.warn('`result` is less than `up`');
      }
      if (result > down) {
        console.warn('`result` is greater than `down`');
      }
    } else if (typeof(down) === 'number') {
      // at top, going up
      result = down + increment;
    } else if (typeof(up) === 'number') {
      // at bottom, going down
      result = up - increment;
    } else {
      return zero;
    }
    return result;
  }

  return RelativeSort;
});

// _this.precision = options.precision || 25;
// _this.startChar = options.startChar || '!';
// _this.endChar = options.endChar || '~';
// if (_this.startChar >= _this.endChar) {
//   throw new Error('endChar must be greater than startChar');
// }
// _this.middleChar = getMiddleChar(_this.startChar.charCodeAt(0), _this.endChar.charCodeAt(0));
//
// RelativeSort.prototype.getSortText = function(a, b) {
//   var _this = this,
//     result = getSortText(a, b, _this.startChar, _this.endChar);
//
//   if (result.length > _this.precision) {
//     console.warn('`result` is greater than', _this.precision, 'letters. truncating.');
//     result = result.substr(0, _this.precision);
//   }
//
//   if (result < a) {
//     console.warn('`result` is less than `a`');
//   }
//   if (result > b) {
//     console.warn('`result` is greater than `b`');
//   }
//   return result;
// };
//
// function getSortText(a, b, startChar, endChar) {
//   if (a > b) {
//     throw new Error('`a` cannot be more than `b`');
//   }
//
//   var initialB = b,
//     i, length,
//     aCharCode, bCharCode;
//
//   // pad a with start char
//   while (a.length < b.length) {
//     a += startChar;
//   }
//   // pad b with end char
//   while (b.length < a.length) {
//     b += endChar;
//   }
//
//   if (a === b) {
//     return initialB;
//   }
//
//   length = a.length;
//   for (i = 0; i < length; i++) {
//     aCharCode = a.charCodeAt(i);
//     bCharCode = b.charCodeAt(i);
//
//     if (aCharCode !== bCharCode) {
//       if (mustExtendLength(aCharCode, bCharCode)) {
//         a = a.substr(0, i + 1);
//         if (a.length < i + 1) {
//           return a + startChar;
//         } else {
//           return a + getMiddleChar(startChar.charCodeAt(0), endChar.charCodeAt(0));
//         }
//       } else {
//         return a.substr(0, i) + getMiddleChar(aCharCode, bCharCode);
//       }
//     }
//   }
//
//   if (a.length < i) {
//     a += startChar;
//   }
//   return a + getMiddleChar(startChar.charCodeAt(0), endChar.charCodeAt(0));
// }
//
// function getMiddleChar(aCharCode, bCharCode) {
//   return String.fromCharCode(aCharCode + Math.floor((bCharCode - aCharCode) / 2));
// }
//
// function mustExtendLength(aCharCode, bCharCode) {
//   return (bCharCode - aCharCode) < 2;
// }
