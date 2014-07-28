define('src/dataservices/inventoryenginesrv', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/inventoryenginesrv',
      result = {};
    [

      'PurchaseOrder',
      'PurchaseOrderItems',
      'PackingSlip',
      'ProductBarcode',
      'PackingSlipItem',
      'ProductBarcodeTracking',
      'WarehouseSiteList',
      'LocationTypeList',
      'Locations',
      'ProductBarcodeLocations',
      'VendorList'
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
