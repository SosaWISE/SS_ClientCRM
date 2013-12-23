define('spec/runner', [
  // 'app/../loadDependencies'
], function() {
  "use strict";
  return function(mockSettings, specGroups, cb) {
    (function loadNext() {
      // pop first spec group in array
      var group = specGroups.shift();
      if (group) {
        // load next spec group
        require(group, loadNext);
      } else {
        require([
          'mock/index'
        ], function(mock) {
          if (mockSettings) {
            mock(mockSettings);
          }

          var jasmineEnv = jasmine.getEnv(),
            htmlReporter;

          jasmineEnv.updateInterval = 1000;
          htmlReporter = new jasmine.HtmlReporter();
          jasmineEnv.addReporter(htmlReporter);

          jasmineEnv.specFilter = function(spec) {
            return htmlReporter.specFilter(spec);
          };

          jasmineEnv.execute();

          cb();
        });
      }
    })();
  };
});
