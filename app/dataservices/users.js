define('src/dataservices/users', [
  'src/core/utils',
  'src/core/dataservice.base',
  'src/config'
], function(
  utils,
  DataserviceBase,
  config
) {
  "use strict";

  function DataserviceEvents() {
    DataserviceEvents.super_.call(this, 'AuthSrv', config.serviceDomain);
  }
  utils.inherits(DataserviceEvents, DataserviceBase);

  //
  // helper functions
  //

  DataserviceEvents.prototype.getData = function(data, cb) {
    this.post('UsersRead', data, null, cb);
  };

  return DataserviceEvents;
});
