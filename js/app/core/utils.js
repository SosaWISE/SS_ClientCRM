define('src/core/utils', [
], function() {
  "use strict";

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

  };
});
