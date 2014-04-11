define('src/core/utils', [
  'src/core/jsonhelpers',
], function(
  jsonhelpers
) {
  "use strict";

  var utils = {
    no_op: function() {},

    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true,
        },
      });
    },

    safeCallback: function(cb, successFn, errorFn) {
      if (!utils.isFunc(cb)) {
        cb = utils.no_op;
      }
      if (!utils.isFunc(successFn)) {
        throw new Error('successFn must be a function');
      }
      if (errorFn && !utils.isFunc(errorFn)) {
        throw new Error('errorFn must be a function or falsey');
      }
      // return a function to be called when the async operation is complete
      return function(err, resp, ctx) {
        try {
          if (err && errorFn) {
            errorFn(err, resp, ctx);
          } else {
            successFn(err, resp, ctx);
          }
        } catch (ex) {
          err = {
            Message: ex.message
          };
        } finally {
          cb(err, resp);
        }
      };
    },

    clone: function(value) {
      if (value == null) {
        return value;
      } else {
        return jsonhelpers.parse(jsonhelpers.stringify(value));
      }
    },

    isFunc: function(obj) {
      return typeof(obj) === 'function' || (obj instanceof Function);
    },
    isStr: function(obj) {
      return typeof(obj) === 'string' || (obj instanceof String);
    },
    isNum: function(obj) {
      return typeof(obj) === 'number' || (obj instanceof Number);
    },

  };

  return utils;
});
