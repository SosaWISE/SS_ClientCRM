define('src/dataservices/scheduleenginesrv', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/scheduleenginesrv',
      result = {};
    [

      'TicketStatusCodeList',
      'TicketTypeList',
      'SeTicketList',
      'SeTicket',
      'SeScheduleTicket',
      'SeScheduleTicketList',
      'SeScheduleBlockList',
      'SeScheduleBlock',
      'SeTechnicianAvailability',
      'SeTicketList',
      'SeTechnicianAvailabilityList'
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
