define('src/dataservices/accountingengine', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/accountingenginesrv',
      result = {};

    [
      'aging',
      'billingInfoSummary',
      'invoices',
      'invoiceItems',
      'customerSearches',
      'customerCardInfos'
    ].forEach(function(collectionName) {
        result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
      });

    return result;
  };
});
