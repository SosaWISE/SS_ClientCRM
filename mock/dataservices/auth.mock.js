define("mock/dataservices/auth.mock", [
  "dataservice",
  "src/core/mockery",
], function(
  dataservice,
  mockery
) {
  "use strict";

  function mock(settings) {
    function send(code, value, setter, cb, timeout) {
      mockery.send(code, value, setter, cb, timeout || settings.timeout);
    }

    dataservice.api_auth.user.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case "SessionData":
          result = {};
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.api_auth.user.save = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case "SessionStart":
          result = null; // getUserResult();
          break;
        case "SignIn":
          result = {
            Token: null,
            User: getUserResult(),
          };
          break;
        case "SignOut":
          result = true;
          break;
      }
      send(0, result, setter, cb);
    };
  }

  function getUserResult() {
    return {
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
        "SSE_CMS_CORS",
        "HR_MAN",
        "CONTRACT_ADMIN",
      ],
      Actions: [
        "Hr_User_Edit"
      ],
    };
  }

  // return function(settings, config) {
  //   if (!config.canMockLogin) {
  //     return;
  //   }
  //   SessionDataservice.prototype.start = function(appToken, cb) {
  //     window.setTimeout(function() {
  //       var resp = {
  //         Code: 0,
  //         Message: "",
  //         Value: {
  //           // logged in
  //           UserID: 0,
  //           DealerId: 5000,
  //           Ssid: null,
  //           SessionID: 0,
  //           Username: "DevUser",
  //           Firstname: "Master",
  //           Lastname: "Account",
  //           GPEmployeeID: "MSTR001",
  //           UserEmployeeTypeID: "CORP",
  //           UserEmployeeTypeName: "Corporate",
  //           SecurityLevel: 9,
  //           Apps: [
  //             "sse_cms_cors",
  //             "hr_man",
  //             "contract_admin",
  //           ],
  //           Actions: [
  //             "hr_user_edit"
  //           ],
  //         },
  //       };
  //       cb(null, resp);
  //     }, settings.timeout);
  //   };
  //   SessionDataservice.prototype.terminate = function(cb) {
  //     cb({
  //       Message: "not implemented",
  //     });
  //   };
  // };

  return mock;
});
