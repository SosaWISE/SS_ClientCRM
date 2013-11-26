define('src/util/utils', [
], function() {
  "use strict";

  return {
    escapeRegExp: function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },

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

    argsToArray: function(args, fromStart, fromEnd) {
      fromStart = fromStart || 0;
      var i = 0,
        length = (args.length - fromStart) - (fromEnd || 0),
        array = new Array(length);
      while (i < length) {
        array[i] = args[i + fromStart];
        i++;
      }
      return array;
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
