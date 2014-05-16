define('src/dataservices/salessummary', [
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
      'pointSystems',
      'activationfees',
      'surveytypes',
      'panelTypes',
      'cellularTypes',
      'vendorAlarmcomPacakges',
      'equipmentbypointsget',
      'contractLengthsGet',
      'frequentlyInstalledEquipmentGet',
      'invoiceRefresh',
      'invoiceMsIsntalls'
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
