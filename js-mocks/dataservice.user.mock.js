define('mock/dataservice.user.mock', [
  'src/core/mockery',
  'src/dataservice.user'
], function(
  mockery,
  UserDataservice
) {
  "use strict";

  return function(settings) {
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
