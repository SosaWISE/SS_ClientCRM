define('src/core/helpers', [
  'ko'
], function(
  ko
) {
  "use strict";

  var obj;

  obj = {

    // onetime: function(fn) {
    //   var onetime = obj.createOnetimer(fn);
    //   onetime();
    //   return;
    // },
    onetimer: function(load) {
      var callbacks = [],
        loaded = ko.observable(false),
        loading = ko.observable(false);

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

      function loadCb() {
        if (!loading()) {
          console.log('onetimer: loadCb called but wasn\'t loading');
          return;
        }
        loading(false);
        loaded(true);

        callbacks.forEach(function(cb) {
          cb();
        });
        return true;
      }
      once.loadCb = loadCb;
      once.loaded = loaded;
      once.loading = loading;
      return once;
    },
  };

  return obj;
});
