define('src/dataservices/qualify', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var surveyServiceDomain = config.serviceDomain + '/qualifysrv',
      result = {};

    [
      'salesrep',
      'technician',
      'addressValidation',
      'runCredit',
      'qualifyCustomerInfos',
      'insideSales',
      'customerMasterFiles',
      'leads',
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, surveyServiceDomain);
    });

    return result;
  };
});
