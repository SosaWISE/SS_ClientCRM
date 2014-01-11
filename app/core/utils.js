define('src/core/utils', [
  'src/core/jsonhelpers',
], function(
  jsonhelpers
) {
  "use strict";

  function no_op() {}

  return {

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

    safeCallback: function(err, action, cb) {
      cb = cb || no_op;
      if (err) {
        return cb(err);
      }
      try {
        action();
      } catch (ex) {
        err = {
          Message: ex.message
        };
      } finally {
        cb(err);
      }
    },

    clone: function(value) {
      if (value == null) {
        return value;
      } else {
        return JSON.parse(JSON.stringify(value, jsonhelpers.replacer), jsonhelpers.reviver);
      }
    },

  };
});
