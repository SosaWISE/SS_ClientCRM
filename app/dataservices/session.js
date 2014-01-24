define('src/dataservices/session', [
  'src/core/utils',
  'src/core/dataservice.base',
  'src/config'
], function(
  utils,
  DataserviceBase,
  config
) {
  "use strict";

  function SessionDataservice() {
    SessionDataservice.super_.call(this, 'AuthSrv', config.serviceDomain);
  }
  utils.inherits(SessionDataservice, DataserviceBase);

  //
  // helper functions
  //
  SessionDataservice.prototype.start = function(appToken, cb) {
    this.post('SessionStart', {
      AppToken: appToken,
    }, null, cb);
  };
  SessionDataservice.prototype.terminate = function(cb) {
    this.post('SessionTerminate', null, null, cb);
  };

  return SessionDataservice;
});
