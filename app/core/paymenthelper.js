define('src/core/paymenthelper', [
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

  function mod10Checksum(total) {
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
    result = mod10Checksum(luhnSum(str)) === checksum;
    return result;
  }

  function addLuhnChecksum(str) {
    str = String(str);

    var checksum = mod10Checksum(luhnSum(str));
    if (checksum < 0) {
      return str;
    }
    return str + checksum;
  }

  //
  //
  //
  function isValidCreditCard(name, str) {
    var data = ccData[name];
    return data && data.regx.test(str) && luhnTest(str);
  }
  // Regular expressions obtained from RegexBuddy's library
  ccData = {
    amex: {
      name: 'American Express',
      regx: /^3[47][0-9]{13}$/,
    },
    visa: {
      name: 'Visa',
      regx: /^4[0-9]{12}(?:[0-9]{3})?$/,
    },
    mastercard: {
      name: 'MasterCard',
      regx: /^5[1-5][0-9]{14}$/,
    },
    discover: {
      name: 'Discover',
      regx: /^6(?:011|5[0-9][0-9])[0-9]{12}$/,
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

  function isValidExpiration(year, month, now) {
    var dt = moment([year, month]).endOf('month');
    now = moment(now);
    return now.isBefore(dt);
  }

  //
  //
  //
  function isValidRoutingNum(str) {
    // convert string to array
    var d = str.split('').map(Number),
      checksum,
      result = false;
    if (d.length === 9) {
      checksum = (
        7 * (d[0] + d[3] + d[6]) +
        3 * (d[1] + d[4] + d[7]) +
        9 * (d[2] + d[5])
      ) % 10;
      result = d[8] === checksum;
    }
    return result;
  }

  return {
    luhnSum: luhnSum,
    mod10Checksum: mod10Checksum,
    luhnTest: luhnTest,
    addLuhnChecksum: addLuhnChecksum,
    ccData: ccData,
    isValidCreditCard: isValidCreditCard,
    getExpirationMonths: getExpirationMonths,
    getExpirationYears: getExpirationYears,
    isValidExpiration: isValidExpiration,
    isValidRoutingNum: isValidRoutingNum,
  };
});
