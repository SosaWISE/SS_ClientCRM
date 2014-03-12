define('src/dataservices/monitoringstation', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/msaccountsetupsrv',
      result = {};

    [
      'accounts',
      'emergencyContacts',
      'emergencyContactPhoneTypes',
      'emergencyContactRelationships',
      'monitoringStationOS',
      'equipments',
      'systemDetails',
      'serviceTypes',
      'panelTypes',
      'dslSeizureTypes',
    ].forEach(function(collectionName) {
        result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
      });

    return result;
  };
});