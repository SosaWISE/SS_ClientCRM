/* global jasmine */
(function() {
  'use strict';

  var jasmineEnv = jasmine.getEnv(),
    htmlReporter;

  jasmineEnv.updateInterval = 1000;
  htmlReporter = new jasmine.HtmlReporter();
  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  jasmineEnv.execute();
})();
