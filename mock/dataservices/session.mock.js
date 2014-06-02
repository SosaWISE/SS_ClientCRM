define('mock/dataservices/session.mock', [
  'src/core/mockery',
  'src/dataservices/session'
], function(
  mockery,
  SessionDataservice
) {
  "use strict";

  return function(settings, config) {
    if (!config.canMockLogin) {
      return;
    }

    SessionDataservice.prototype.start = function(appToken, cb) {
      setTimeout(function() {
        var resp = mockery.fromTemplate({
          Code: 0,
          Message: '',
          Value: {
            // logged in
            AuthUser: {
              boh: '???',
            },
            // // logged out
            // AuthUser: null,
          },
        });
        cb(null, resp);
      }, settings.timeout);
    };
    SessionDataservice.prototype.terminate = function(cb) {
      cb({
        Message: 'not implemented',
      });
    };
  };
});
