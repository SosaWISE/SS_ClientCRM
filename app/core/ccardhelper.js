define('src/core/ccardhelper', [
  'moment',
], function(
  moment
) {
  "use strict";

  var luhnPreCalculatedEvenValues,
    ccData,
    expirationMonths;


  // list of precalculated values using this commented out algorithm:
  // (function() {
  //   var i, n;
  //   for (i = 0; i < 10; i++) {
  //     n = i * 2;
  //     if (n > 9) {
  //       n = n - 9;
  //     }
  //     luhnPreCalculatedOddValues.push(n);
  //   }
  // })();
  luhnPreCalculatedEvenValues = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

  function luhnSum(str) {
    // convert string to array
    var nums = str.split('').map(Number);
    // reverse the list
    nums.reverse();
    // sum list of numbers using luhn algorithm
    return nums.reduce(function(total, n, index) {
      //    index is           even                             odd
      n = ((index % 2 === 0) ? luhnPreCalculatedEvenValues[n] : n);
      return total + n;
    }, 0);
  }

  function computeChecksum(total) {
    if (total < 0) {
      return -1;
    }
    return (10 - (total % 10)) % 10;
  }

  function luhnTest(str) {
    str = String(str);

    var result = false,
      splitIndex = str.length - 1,
      checksum;
    // get checksum digit (last digit)
    checksum = Number(str.substr(splitIndex));
    // remove checksum from string
    str = str.substr(0, splitIndex);
    // calculate luhn sum and its checksum and
    // then compare that to the expected checksum
    result = computeChecksum(luhnSum(str)) === checksum;
    return result;
  }

  function addLuhnChecksum(str) {
    str = String(str);

    var checksum = computeChecksum(luhnSum(str));
    if (checksum < 0) {
      return str;
    }
    return str + checksum;
  }

  //
  //
  //
  function isValidCreditCard(name, str) {
    var result = false,
      data = ccData[name];
    if (data) {
      if (data.prefixes.some(function(prefix) {
        return str.substr(0, prefix.length) === prefix;
      })) {
        return luhnTest(str);
      }
    }
    return result;
  }
  ccData = {
    amex: {
      name: 'American Express',
      digits: 15,
      prefixes: [
        '34',
        '37',
      ],
    },
    visa: {
      name: 'Visa',
      digits: 16,
      prefixes: [
        '4',
      ],
    },
    mastercard: {
      name: 'MasterCard',
      digits: 16,
      prefixes: [
        '51',
        '52',
        '53',
        '54',
        '55',
      ],
    },
    discover: {
      name: 'Discover',
      digits: 16,
      prefixes: [
        '6011',
        '65',
      ],
    },
  };

  //
  //
  //
  function getExpirationMonths() {
    // the length of this code is only slightly shorter than its output
    // so its main benefit is to potentially be localizable
    if (!expirationMonths) {
      var i, length = 12,
        day = moment("Jan 5, 1995");
      expirationMonths = new Array(length);
      for (i = 0; i < length; i++) {
        expirationMonths[i] = {
          value: i,
          text: day.format('MM-MMMM'),
        };
        day.add('months', 1);
      }
    }
    return expirationMonths;
  }

  function getExpirationYears(length, year) {
    length = length || 15;
    year = year || moment().get('year');
    var i, result = new Array(length);
    for (i = 0; i < length; i++) {
      result[i] = {
        value: year,
        text: year + '',
      };
      year++;
    }
    return result;
  }

  return {
    luhnTest: luhnTest,
    addLuhnChecksum: addLuhnChecksum,
    ccData: ccData,
    isValidCreditCard: isValidCreditCard,
    getExpirationMonths: getExpirationMonths,
    getExpirationYears: getExpirationYears,
  };
});
