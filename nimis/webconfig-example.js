define('webconfig', [], function() {
  "use strict";
  return {
    useMocks: false,
    serviceDomain: 'sse.services.CmsCORS',
    //serviceDomain: 'cs1.stg.nexsense.com',
    salesInfosMax: {
      v01: 191208,
      v02: 999999,
    },
  };
});