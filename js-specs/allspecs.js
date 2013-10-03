define([
  '../js/loadDependencies'
], function() {
  require([

    '../../js-specs/app/router/spec.route',
    '../../js-specs/app/router/spec.router',

    '../../js-specs/app/util/spec.joiner',
    '../../js-specs/app/util/spec.strings',

    '../../js-specs/app/spec.dataservice.base',
    '../../js-specs/app/spec.notify',

  ], function() {
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
  });
});
