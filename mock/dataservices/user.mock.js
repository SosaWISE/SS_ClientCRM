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
      window.setTimeout(function() {
        var resp = {
          Code: 0,
          Message: '',
          Value: {
            UserID: 0,
            DealerId: 5000,
            Ssid: null,
            SessionID: 0,
            Username: "DevUser",
            Firstname: "Master",
            Lastname: "Account",
            GPEmployeeID: "MSTR001",
            UserEmployeeTypeID: "CORP",
            UserEmployeeTypeName: "Corporate",
            SecurityLevel: 9,
            Apps: [
              "sse_cms_cors",
              "hr_man",
            ],
            Actions: [
              "hr_user_edit"
            ],
          },
        };
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
