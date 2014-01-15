define('src/core/helpers', [
  'ko'
], function(
  ko
) {
  "use strict";

  var obj;

  obj = {
    onetimer: function(load) {
      var callbacks = [],
        loaded = ko.observable(false),
        loading = ko.observable(false),
        loadErr = ko.observable(false);

      function once(cb) {
        if (loaded()) {
          if (typeof(cb) === 'function') {
            cb();
          }
        } else {
          if (typeof(cb) === 'function') {
            callbacks.push(cb);
          }

          if (!loading()) {
            loading(true);
            if (typeof(load) === 'function') {
              load(loadCb);
            }
          }
        }
      }

      function loadCb(err) {
        if (!loading()) {
          console.log('onetimer: loadCb called but wasn\'t loading');
          return;
        }
        loading(false);
        loaded(true);
        loadErr(err);

        callbacks.forEach(function(cb) {
          cb(err);
        });
        return true;
      }
      once.loadCb = loadCb;
      once.loaded = loaded;
      once.loading = loading;
      once.loadErr = loadErr;
      return once;
    },
  };

  return obj;
});
