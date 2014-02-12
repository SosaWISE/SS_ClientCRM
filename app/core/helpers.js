define('src/core/helpers', [
  'ko',
  'src/core/utils',
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

      function once(cb) {
        if (loaded()) {
          if (utils.isFunc(cb)) {
            cb();
          }
        } else {
          if (utils.isFunc(cb)) {
            callbacks.push(cb);
          }

          if (!loading()) {
            loading(true);
            if (utils.isFunc(load)) {
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
