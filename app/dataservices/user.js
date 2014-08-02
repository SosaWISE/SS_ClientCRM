define('src/dataservices/user', [
  'src/core/utils',
  'src/core/dataservice.base',
  'src/config'
], function(
  utils,
  DataserviceBase,
  config
) {
  "use strict";

  function UserDataservice() {
    UserDataservice.super_.call(this, 'AuthSrv', config.serviceDomain);
  }
  utils.inherits(UserDataservice, DataserviceBase);

  //
  // helper functions
  //
  UserDataservice.prototype.auth = function(data, cb) {
    this.post('UserAuth', data, null, cb);
  };
  UserDataservice.prototype.update = function(data, cb) {
    this.post('UserUpdate', data, null, cb);
  };
  UserDataservice.prototype.logout = function(cb) {
    this.post('Logout', null, null, cb);
  };
  // UserDataservice.prototype.signUp = function(data, cb) {
  //   this.post('UserSignUp', data, cb);
  // };

  return UserDataservice;
});
