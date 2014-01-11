/** dataserivce.salessummary.js */
define('src/dataservice.salessummary', [
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
      'pointsystems',
      'activationfees',
      'surveytypes',
      'cellulartypes',
      'vendoralarmcompacakges',
      'equipmentbypointsget',
      'contractlengthsget',
      'frequentlyinstalledequipmentget',
    ].forEach(function(collectionName) {
        result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
      });

    return result;
  };
});
