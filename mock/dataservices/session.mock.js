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
      window.setTimeout(function() {
        var resp = {
          Code: 0,
          Message: '',
          Value: {
            // logged in
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
              "contract_admin",
            ],
            Actions: [
              "hr_user_edit"
            ],
          },
        };
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
