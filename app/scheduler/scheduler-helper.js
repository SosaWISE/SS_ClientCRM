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

  helper.afterTicketLoaded = function(item) {
    var statusCodesMap = schedulercache.getMap("statusCodes");
    var serviceTypesMap = schedulercache.getMap("serviceTypes");

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

    // times
    timeAfterLoad(item.StartOn);
    timeAfterLoad(item.EndOn);

    return item;
  };
  helper.beforeTicketSaved = function(item) {
    // times
    timeBeforeSave(item.StartOn);
    timeBeforeSave(item.EndOn);

    return item;
  };


  helper.afterTechWeekDayLoaded = function(item) {
    // times
    timeAfterLoad(item.StartTime);
    timeAfterLoad(item.EndTime);

    return item;
  };
  helper.beforeTechWeekDaySaved = function(item) {
    // times
    timeBeforeSave(item.StartTime);
    timeBeforeSave(item.EndTime);

    return item;
  };

  function timeAfterLoad(dt) {
    if (dt) {
      // Appointment at 02/01/2015 12:23 am
      // timeAfterLoad-from 2015-01-31T18:23:00-06:00
      // timeAfterLoad-  to 2015-02-01T00:23:00-06:00
      //
      //@NOTE: Times need to be the same regardless of the browser's timezone,
      // so here we add the timezone and in `timeBeforeSave` we remove it.
      // This makes it so the time is always the same. A 9:00 AM appointment
      // added by someone in the callcenter in Utah for a customer in Florida
      // is still 9:00 AM when the tech in Florida views his tickets.
      //
      // console.log("timeAfterLoad-from", moment(dt).format());
      dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
      // console.log("timeAfterLoad-  to", moment(dt).format());
    }
  }

  function timeBeforeSave(dt) {
    if (dt) {
      // Appointment at 02/01/2015 12:23 am
      // timeBeforeSave-from 2015-02-01T00:23:00-06:00
      // timeBeforeSave-  to 2015-01-31T18:23:00-06:00
      //
      // console.log("timeBeforeSave-from", moment(dt).format());
      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
      // console.log("timeBeforeSave-  to", moment(dt).format());
    }
  }

  return helper;
});
