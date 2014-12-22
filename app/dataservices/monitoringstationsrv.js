define("src/dataservices/monitoringstationsrv", [
  "src/core/dataservice.base",
  "src/config"
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + "/monitoringStationSrv",
      result = {};

    [
      "msAccounts",
      "accounts",
      "msAccountSalesInformations",
      "dispatchAgencies",
      "accountDispatchAgencyAssignments",
      "premiseAddress",
      "dispatchAgencyTypes",
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
