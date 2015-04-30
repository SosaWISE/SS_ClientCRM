define("src/dataservices/session", [
  "src/core/utils",
  "src/core/dataservice.base",
  "howie"
], function(
  utils,
  DataserviceBase,
  howie
) {
  "use strict";

  function SessionDataservice() {
    SessionDataservice.super_.call(this, "AuthSrv", howie.fetch("config").serviceDomain);
  }
  utils.inherits(SessionDataservice, DataserviceBase);

  //
  // helper functions
  //
  SessionDataservice.prototype.start = function(appToken, cb) {
    this.post("SessionStart", {
      AppToken: appToken,
    }, null, cb);
  };
  SessionDataservice.prototype.sessionData = function(cb) {
    this.get("SessionData", null, null, cb);
  };

  return SessionDataservice;
});
