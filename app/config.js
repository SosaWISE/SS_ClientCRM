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
  // ONLY CONFIG DEFAULTS GO IN THIS FILE
  // ALL OTHER CONFIG SETTINGS GO IN webconfig.js
  //
  set('useMocks', false);
  set('canMockLogin', true); // only relevant if `useMocks` is true
  //
  set('token', 'SSE_CMS_CORS');
  // set('serviceDomain', 'sse.services.cmscors'); // every environment should have this set in webconfig.js
  set('logErrors', true);
  set('titlePrefix', '');
  set('titlePostfix', '| CRM');
  set('leadSourceId', 1);
  set('leadDispositionId', 9);
  set('apiTimeout', 1000 * 30);
  set('joinerTimeout', 1000 * 60);
  set('pingInterval', 1000 * 60 * 29); // One minute less than the session timeout (30 min).

  //
  set('accounts', {
    hideNav: false,
    hideNotes: false,
  });

  return config;
});
