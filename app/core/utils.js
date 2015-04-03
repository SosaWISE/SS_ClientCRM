define('src/core/utils', [
  'src/core/jsonhelpers',
], function(
  jsonhelpers
) {
  "use strict";

  var utils = {
    noop: function() {},

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
    assertProps: function(obj, propNames) {
      propNames.forEach(function(name) {
        if (obj[name] == null) {
          throw new Error('missing ' + name);
        }
      });
    },

    safeCallback: function(cb, successFn, errorFn) {
      if (!utils.isFunc(cb)) {
        cb = utils.noop;
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
          console.error(ex.stack);
          err = {
            Message: ex.stack,
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
    isDate: function(obj) {
      return (obj instanceof Date);
    },
    getLocalDateTime: function(obj) {
      var d = new Date(obj);
      var t = new Date();
      var h = t.getTimezoneOffset() / -60;

      return d.setHours(d.getHours() + h);
    },
    isObject: function(obj) {
      return typeof(obj) === 'object' || (obj instanceof Object);
    },

    // actually sets if null or undefined...
    setIfNull: function(val, propName, defaultValue) {
      if (utils.isObject(propName)) {
        for (var name in propName) {
          ifNull(val, name, propName[name]);
        }
      } else {
        ifNull(val, propName, defaultValue);
      }
    },

  };
  utils.no_op = utils.noop; // only for backwards compatibiltiy
  utils.ensureProps = utils.assertProps; // backwards compatibiltiy

  function ifNull(val, propName, defaultValue) {
    if (val[propName] == null) {
      val[propName] = defaultValue;
    }
  }

  return utils;
});
