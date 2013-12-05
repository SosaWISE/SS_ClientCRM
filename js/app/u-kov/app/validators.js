define('src/u-kov/app/validators', [
  'src/util/strings'
], function(
  strings
) {
  "use strict";
  /* jshint eqnull:true */

  var validators = {},
    notString = 'Value is not a string',
    notBool = 'Value is not a boolean',
    notInt = 'Value is not an int',
    notFloat = 'Value is not a float',
    // , notDate = 'Value is not a date',
    notInRange = 'Value is not between {0} and {1}',
    maxLength = 'Value is more than {0} letters',
    notPattern = 'Value does not match specified pattern',
    valRequired = 'Value is required',
    passwordMsg = 'A password must be atleast {0} or more letters and contain at least one upper case letter, one lower case letter and one digit.',

    // 1 uppercase, 1 lowercase, and 1 number
    passwordRegex = /^(?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])\S+$/;

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
  // validators.isDate = function(message) {
  // 	message = message || notDate;
  // 	return getDateErrMsg(val/*, model*/) {
  // 		if (val == null) {
  // 			return;
  // 		}
  // 		if (true) { //@TODO:
  // 			return message;
  // 		}
  // 	};
  // };

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
      if (!val && val !== 0) {
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

  return validators;
});
