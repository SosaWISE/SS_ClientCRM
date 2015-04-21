define("src/dataservices/user", [
  "src/core/utils",
  "src/core/dataservice.base",
  "howie"
], function(
  utils,
  DataserviceBase,
  howie
) {
  "use strict";

  function UserDataservice() {
    UserDataservice.super_.call(this, "AuthSrv", howie.fetch("config").serviceDomain);
  }
  utils.inherits(UserDataservice, DataserviceBase);

  //
  // helper functions
  //
  UserDataservice.prototype.auth = function(data, cb) {
    this.post("UserAuth", data, null, cb);
  };
  UserDataservice.prototype.update = function(data, cb) {
    this.post("UserUpdate", data, null, cb);
  };
  UserDataservice.prototype.logout = function(cb) {
    this.post("Logout", null, null, cb);
  };
  // UserDataservice.prototype.signUp = function(data, cb) {
  //   this.post("UserSignUp", data, cb);
  // };

  return UserDataservice;
});
