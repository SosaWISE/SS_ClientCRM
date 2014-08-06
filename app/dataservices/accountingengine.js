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
      'billingHistory',
      'invoices',
      'invoiceItems',
      'customerSearches',
      'customerCardInfos',
      'customers',
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
