define("src/scheduler/scheduler-helper", [
  "src/scheduler/scheduler-cache",
], function(
  schedulercache
) {
  "use strict";

  var helper = {};

  helper.ensureTypeNames = function(item, statusCodesMap, serviceTypesMap) {
    statusCodesMap = statusCodesMap || schedulercache.getMap("statusCodes");
    serviceTypesMap = serviceTypesMap || schedulercache.getMap("serviceTypes");

    var mapItem;
    //
    mapItem = statusCodesMap[item.StatusCodeId];
    item.StatusCode = mapItem ? mapItem.Name : item.StatusCodeId;
    //
    mapItem = serviceTypesMap[item.ServiceTypeId];
    item.ServiceType = mapItem ? mapItem.Name : item.ServiceTypeId;

    return item;
  };

  return helper;
});
