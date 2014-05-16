/**
 * Default values for window.webconfig
 * To override the defaults, set the values in webconfig.js
 */
// define config module
define('src/config', [
  'webconfig',
  'ko'
], function(
  config,
  ko
) {
  "use strict";

  function set(key, value) {
    // only sets values that haven't already been set.
    if (!config.hasOwnProperty(key)) {
      config[key] = value;
    }
  }

  //
  // Explicit Properties (non-overrideable)
  //
  config.version = '0.0.1';
  config.user = ko.observable();
  // config.logger = ??;

  //
  // Property Defaults (overrideable)
  //
  set('useMocks', false);
  set('token', 'SSE_CMS_CORS');
  set('serviceDomain', 'sse.services.cmscors'); // Local
  // set('serviceDomain', 'cs1.dev.nexsense.com'); // Dev Environment
  // set('serviceDomain', 'cs1.tst.nexsense.com'); // Test Environment
  // set('serviceDomain', 'cs1.stg.nexsense.com'); // Stage Environment
  set('titlePrefix', '');
  set('titlePostfix', '| CRM');
  set('leadSourceId', 1);
  set('leadDispositionId', 9);
  set('apiTimeout', 1000 * 30);
  set('joinerTimeout', 1000 * 60);
  set('pingInterval', 1000 * 60 * 29); // One minute less than the session timeout (30 min).

  return config;
});
