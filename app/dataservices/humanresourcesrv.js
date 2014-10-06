define('src/dataservices/humanresourcesrv', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/humanresourcesrv',
      result = {};
    [

      'RuTeamLocationList',
      'RuTechnician',
      'RuTechnicianList',

      'phoneCellCarriers',
      'recruits',
      'seasons',
      'userEmployeeTypes',
      'users',

    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
