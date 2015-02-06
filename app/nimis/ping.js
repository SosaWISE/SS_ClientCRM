define('src/nimis/ping', [
  'src/dataservice',
  'src/config'
], function(
  dataservice,
  config
) {
  "use strict";

  var run, timeoutId,
    maxAttempts = 3,
    nErrs = 0;

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
      dataservice.base.read({
        link: url,
      }, null, function(err) {
        timeoutId = 0;
        nErrs = (err) ? (nErrs + 1) : 0;
        if (nErrs < maxAttempts) { // stop after N failed attempts
          if (nErrs !== 0) {
            console.warn('still pinging, but user appears to be logged out...', err);
          }
          ping(url);
        } else {
          console.warn('stop pinging, user appears to be logged out.');
        }
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
      timeoutId = 0;
    },
  };
});
