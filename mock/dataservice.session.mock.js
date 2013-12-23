define('mock/dataservice.session.mock', [
  'src/core/mockery',
  'src/dataservice.session'
], function(
  mockery,
  SessionDataservice
) {
  "use strict";

  return function(settings) {
    SessionDataservice.prototype.start = function(appToken, cb) {
      setTimeout(function() {
        var resp = mockery.fromTemplate({
          Code: 0,
          Message: '',
          Value: {
            // logged in
            AuthCustomer: {
              boh: '???',
            },
            // // logged out
            // AuthCustomer: null,
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
