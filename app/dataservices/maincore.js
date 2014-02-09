define('src/dataservices/maincore', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/maincoresrv',
      result = {};

    [
      'departments',
      'notes',
      'notecategory1',
      'notecategory2',
      'notetypes',
      'localizations'
    ].forEach(function(collectionName) {
        result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
      });

    return result;
  };
});
