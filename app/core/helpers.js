define("src/core/helpers", [
  "ko",
  "src/core/utils",
], function(
  ko,
  utils
) {
  "use strict";

  var obj;

  obj = {
    onetimer: function(load) {
      var callbacks = [],
        loaded = ko.observable(false),
        loading = ko.observable(false),
        loadErr = ko.observable(false);

      function once(cb, ensureOne) {
        if (loaded.peek()) {
          if (utils.isFunc(cb)) {
            cb();
          }
        } else {
          if (utils.isFunc(cb)) {
            if (!ensureOne || (callbacks.indexOf(cb) < 0)) {
              callbacks.push(cb);
            }
          }

          if (!loading.peek()) {
            loading(true);
            if (utils.isFunc(load)) {
              load(loadCb);
            }
          }
        }
      }

      function loadCb(err, bubbleErr) {
        if (!loading.peek()) {
          console.log("onetimer: loadCb called but was not loading");
          return;
        }
        loading(false);
        loaded(true);
        loadErr(err);

        if (!bubbleErr) {
          err = null;
        }
        callbacks.forEach(function(cb) {
          cb(err);
        });
        callbacks = [];
        return true;
      }

      // function canReset() {
      //   return !loading.peek();
      // }

      once.loadCb = loadCb;
      once.loaded = loaded;
      once.loading = loading;
      once.loadErr = loadErr;
      // once.canReset = canReset;
      once.reset = function() { //force) {
        // if (force) {
        loading(false);
        callbacks = [];
        // }
        // if (canReset()) {
        loaded(false);
        loadErr(false);
        return true;
        // }
      };
      once.onLoad = function(cb) {
        if (!utils.isFunc(cb)) {
          return;
        }
        if (loaded.peek()) {
          cb();
        } else {
          callbacks.push(cb);
        }
      };
      return once;
    },
  };

  return obj;
});
