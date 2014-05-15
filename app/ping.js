define('src/ping', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  var dataservice = new DataserviceBase(null, config.serviceDomain),
    run, timeoutId;

  function ping(url) {
    // we've stopped
    if (!run) {
      return false;
    }
    // we're already running
    if (timeoutId) {
      return false;
    }

    timeoutId = setTimeout(function() {
      dataservice.read({
        link: url,
      }, null, function(err) {
        if (err) {
          console.warn('stilling pinging, but user appears to be logged out...', err);
        }
        timeoutId = null;
        ping(url);
      });
    }, config.pingInterval);
    return true;
  }

  return {
    start: function(url) {
      run = true;
      return ping(url);
    },
    stop: function() {
      run = false;
      clearTimeout(timeoutId);
      timeoutId = null;
    },
  };
});
