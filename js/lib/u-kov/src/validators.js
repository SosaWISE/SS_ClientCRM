define([], function() {
  "use strict";
  /* jshint eqnull:true, unused:false */

  var validators = {},
    notString = 'Value is not a string',
    notBool = 'Value is not a boolean',
    notInt = 'Value is not an int',
    notFloat = 'Value is not a float',
    // , notDate = 'Value is not a date',
    notInRange = 'Value is not in specified range',
    notPattern = 'Value does not match specified pattern',
    valRequired = 'Value is required',
    passwordMsg = 'A password must be atleast 6 or more letters and contain at least one upper case letter, one lower case letter and one digit.',

    // 1 uppercase, 1 lowercase, and 1 number
    passwordRegex = /^(?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])\S+$/;

  validators.isString = function(message) {
    message = message || notString;
    return function getStringErrMsg(val, model) {
      if (val == null) { // if null or undefined, return undefined
        return;
      }
      if (typeof(val) !== 'string') {
        return message;
      }
    };
  };
  validators.isBool = function(message) {
    message = message || notBool;
    return function getBoolErrMsg(val, model) {
      if (val == null) { // if null or undefined, return undefined
        return;
      }
      if (typeof(val) !== 'boolean') {
        return message;
      }
    };
  };
  validators.isInt = function(message) {
    message = message || notInt;
    return function getIntErrMsg(val, model) {
      if (val == null) { // if null or undefined, return undefined
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
    return function getFloatErrMsg(val, model) {
      if (val == null) { // if null or undefined, return undefined
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
  // 	return function getDateErrMsg(val, model) {
  // 		if (val == null) { // if null or undefined, return undefined
  // 			return;
  // 		}
  // 		if (true) { //@TODO:
  // 			return message;
  // 		}
  // 	};
  // };

  validators.isInRange = function(min, max, message) {
    message = message || notInRange;
    return function getRangeErrMsg(val, model) {
      if (val == null) { // if null or undefined, return undefined
        return;
      }
      // val = parseFloat(val);
      if (val < min || max < val) {
        return message;
      }
    };
  };
  validators.isPattern = function(regex, message) {
    message = message || notPattern;
    return function getPatternErrMsg(val, model) {
      if (val == null) { // if null or undefined, return undefined
        return;
      }
      if (!regex.test(val)) {
        return message;
      }
    };
  };

  validators.isRequired = function(message) {
    message = message || valRequired;
    return function getRequiredErrMsg(val, model) {
      if (!val && val !== 0) {
        return message;
      }
    };
  };

  validators.isPassword = function(message) {
    message = message || passwordMsg;
    return function getRequiredErrMsg(val, model) {
      if (val == null) { // if null or undefined, return undefined
        return;
      }
      if (!passwordRegex.test(val) || val.length < 6) {
        return message;
      }
    };
  };

  return validators;
});
