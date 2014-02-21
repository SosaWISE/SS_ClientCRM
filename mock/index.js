define('mock/index', [
  'mock/dataservices/accountingengine.mock',
  'mock/dataservices/maincore.mock',
  'mock/dataservices/monitoringstation.mock',
  'mock/dataservices/qualify.mock',
  'mock/dataservices/salessummary.mock',
  'mock/dataservices/session.mock',
  'mock/dataservices/survey.mock',
  'mock/dataservices/user.mock',
  'mock/scrum/scrumservice.mock',
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
