define("src/scheduler/scheduler-helper", [
  "ko",
  "src/core/strings",
  "src/scheduler/scheduler-cache",
], function(
  ko,
  strings,
  schedulercache
) {
  "use strict";

  var helper = {};

  var namePartOrder = ["Salutation", "FirstName", "MiddleName", "LastName", "Suffix"];
  helper.formatCustomerName = function(data) {
    data = ko.unwrap(data);
    return strings.joinTrimmed(" ", namePartOrder.map(function(part) {
      return ko.unwrap(data[part]);
    }));
  };

  helper.ensureTicketFields = function(item, statusCodesMap, serviceTypesMap) {
    statusCodesMap = statusCodesMap || schedulercache.getMap("statusCodes");
    serviceTypesMap = serviceTypesMap || schedulercache.getMap("serviceTypes");

    var mapItem;
    //
    mapItem = statusCodesMap[item.StatusCodeId];
    item._StatusCode = mapItem ? mapItem.Name : item.StatusCodeId;
    //
    mapItem = serviceTypesMap[item.ServiceTypeId];
    item._ServiceType = mapItem ? mapItem.Name : item.ServiceTypeId;

    // customer
    item._FullName = helper.formatCustomerName(item);
    item._FullAddress = strings.format("{0} {1}, {2} {3}",
      strings.joinTrimmed(" ", item.StreetAddress, item.StreetAddress2),
      item.City, item.StateId, item.PostalCode);

    return item;
  };

  return helper;
});
