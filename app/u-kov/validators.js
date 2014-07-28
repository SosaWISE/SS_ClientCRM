define('src/u-kov/validators', [
  'src/core/strings',
  'src/core/utils',
  'moment'
], function(
  strings,
  utils,
  moment
) {
  "use strict";

  var validators = {},
    notString = 'Value is not a string',
    notBool = 'Value is not a boolean',
    notInt = 'Value is not an int',
    notFloat = 'Value is not a float',
    // , notDate = 'Value is not a date',
    notInRange = 'Value is not between {0} and {1}',
    maxLength = 'Value is more than {0} letters',
    notInLengthRange = 'Value is not between {0} and {1} letters',
    notPattern = 'Value does not match specified pattern',
    valRequired = 'Value is required',
    passwordMsg = 'A password must be atleast {0} or more letters and contain at least one upper case letter, one lower case letter and one digit.',
    ssnMsg = 'Invalid social security number. Expected format: 123-12-1234.',
    minAgeMsg = 'Minimum age allowed in {0}',
    emailMsg = 'Invalid email',
    zipMsg = 'Invalid postal code. Expected format: 12345',

    // 1 uppercase, 1 lowercase, and 1 number
    passwordRegex = /^(?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])\S+$/,
    ssnExactRegx = /^(?!000)(?!666)[0-8]\d{2}[- ](?!00)\d{2}[- ](?!0000)\d{4}$/,

    relaxedEmailRegx = /^\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}\b$/i,
    zipRegx = /^[0-9]{5}$/;

  validators.isString = function(message) {
    message = message || notString;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      if (typeof(val) !== 'string') {
        return message;
      }
    };
  };
  validators.isBool = function(message) {
    message = message || notBool;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      if (typeof(val) !== 'boolean') {
        return message;
      }
    };
  };
  validators.isInt = function(message) {
    message = message || notInt;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      // if (parseInt(val, 10) !== parseFloat(val)) {
      if (val !== Math.round(val)) {
        return message;
      }
    };
  };
  validators.isFloat = function(message) {
    message = message || notFloat;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      if (typeof(val) !== 'number') {
        // if (isNaN(val)) {
        return message;
      }
    };
  };

  validators.isInRange = function(min, max, message) {
    message = message || notInRange;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      // val = parseFloat(val);
      if (val < min || max < val) {
        return strings.format(message, min, max);
      }
    };
  };
  validators.maxLength = function(max, message) {
    message = message || maxLength;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      if (max < val.length) {
        return strings.format(message, max);
      }
    };
  };
  validators.isInLengthRange = function(min, max, message) {
    message = message || notInLengthRange;
    return function(val) {
      if (val == null) {
        return;
      }
      if (val.length < min || max < val.length) {
        return strings.format(message, min, max);
      }
    };
  };
  validators.isPattern = function(regex, message) {
    message = message || notPattern;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      if (!regex.test(val)) {
        return message;
      }
    };
  };

  validators.isRequired = function(message) {
    message = message || valRequired;
    return function(val /*, model*/ ) {
      if (!val && val !== 0 && val !== false) {
        return message;
      }
    };
  };

  validators.isPassword = function(minLength, message) {
    // ensure min length is 6 or greater
    minLength = Math.max(minLength || 0, 6) || 6;
    message = message || passwordMsg;
    return function(val /*, model*/ ) {
      if (val == null) {
        return;
      }
      if (!passwordRegex.test(val) || val.length < minLength) {
        return message;
      }
    };
  };

  validators.isSsn = function(message) {
    message = message || ssnMsg;
    return function(val /*, model*/ ) {
      if (!val) {
        return;
      }
      if (!ssnExactRegx.test(val)) {
        return message;
      }
    };
  };

  // allow specs to manipulate time and space
  validators.now = function(isLocal) {
    if (isLocal) {
      return moment();
    } else {
      return moment.utc();
    }
  };
  validators.minAge = function(isLocal, min, message) {
    message = message || minAgeMsg;
    return function(bday /*, model*/ ) {
      if (bday == null) {
        return;
      }
      if (!utils.isDate(bday)) {
        return new Error('invalid date');
      }

      // get `now`, move back N years, and the person's birthday is all day
      var cutOffDay = validators.now(isLocal).subtract('years', min).endOf('day');
      if (cutOffDay.isBefore(bday)) {
        return strings.format(message, min);
      }
    };
  };

  validators.isEmail = function(message) {
    message = message || emailMsg;
    return function(val /*, model*/ ) {
      if (!val) {
        return;
      }
      if (!relaxedEmailRegx.test(val)) {
        return message;
      }
    };
  };
  validators.isZipCode = function(message) {
    message = message || zipMsg;
    return function(val /*, model*/ ) {
      if (!val) {
        return;
      }
      if (!zipRegx.test(val)) {
        return message;
      }
    };
  };

  return validators;
});
