/**
 * Default values for window.webconfig
 * To override the defaults, set the values in webconfig.js
 */
// define config module
define([
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
  set('token', 'SSE_MAIN_PORTAL');
  set('serviceDomain', 'sse.services.cors');
  set('titlePrefix', '');
  set('titlePostfix', '| CRM');

  return config;
});
