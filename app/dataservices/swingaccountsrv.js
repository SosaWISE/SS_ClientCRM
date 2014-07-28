define('src/dataservices/swingaccountsrv', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/swingaccountsrv',
      result = {};
    [
      // 'accounts',
      'CustomerSwingInfo',
      'CustomerSwingPremiseAddress',
      'CustomerSwingEmergencyContact',
      'CustomerSwingEquipmentInfo',
      'CustomerSwingSystemDetails',
      'CustomerSwungInfo',
      'CustomerSwingInterim',
      'CustomerSwingAddDnc'
      /* 'msAccount',
      'msAccountCustomer',
      'msAccountPremiseAddress',
      'msAccountEmergencyContact',
      'msAccountInventory',
      'msAccountEquipment',
      'msZoneType',
      'msEquipmentLocation'*/
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
