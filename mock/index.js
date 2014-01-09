define('mock/index', [
  'mock/dataservice.accountingengine.mock',
  'mock/dataservice.qualify.mock',
  'mock/dataservice.salessummary.mock',
  'mock/dataservice.session.mock',
  'mock/dataservice.survey.mock',
  'mock/dataservice.user.mock',
], function() {
  "use strict";

  var args = arguments; // all required mocks

  return function(settings) {
    settings = {
      timeout: settings.timeout || 0,
    };

    var length = args.length,
      i, mock;
    for (i = 0; i < length; i++) {
      mock = args[i];
      mock(settings);
    }
  };
});
