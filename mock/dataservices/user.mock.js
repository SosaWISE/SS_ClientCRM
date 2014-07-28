define('mock/dataservices/user.mock', [
  'src/core/mockery',
  'src/dataservices/user'
], function(
  mockery,
  UserDataservice
) {
  "use strict";

  return function(settings, config) {
    if (!config.canMockLogin) {
      return;
    }

    UserDataservice.prototype.auth = function(data, cb) {
      setTimeout(function() {
        var resp = mockery.fromTemplate({
          Code: 0,
          Message: '',
          Value: {
            boh: '???',
          },
        });
        cb(null, resp);
      }, settings.timeout);
    };
    UserDataservice.prototype.update = function(data, cb) {
      cb({
        Message: 'not implemented',
      });
    };
  };
});
