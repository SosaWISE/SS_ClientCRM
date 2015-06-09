define("src/sales/dataservice", [
  "src/core/dataservice.base",
  "howie",
], function(
  DataserviceBase,
  howie
) {
  "use strict";

  function createService(name, subPaths, domain) {
    domain = (domain || howie.fetch("config").serviceDomain) + "/" + name;

    var result = {};
    subPaths.forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, domain);
    });
    return result;
  }

  return {
    base: new DataserviceBase(null, howie.fetch("config").serviceDomain),

    //
    // crm service
    //
    api_auth: createService("api/auth", [
      "user",
    ], howie.fetch("config").serviceDomain),

    //
    // sales service
    //
    api_sales: createService("api/sales", [
      "areas",
      "contacts",
      "categorys",
      "systemTypes",
    ]),

    //
    // hr service
    //
    api_hr: createService("api/hr", [
      "reports",
      "teams",
      "users",
    ]),
  };
});
