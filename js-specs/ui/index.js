define('spec/ui/index', [
  'spec/runner',
  'spec/ui/_all',
  'jquery',
  'spec/ui/browser',
  'spec/ui/jasmine-matchers'
], function(
  runner,
  uiSpecs,
  jquery,
  browser
) {
  'use strict';

  var specContainer = jquery('.container.specs'),
    clickedTab = false;

  function tabsMouseout() {
    var specsActive = jquery('.tab.specs a').hasClass('active');
    if (clickedTab) {
      if (specsActive) {
        specContainer.show();
      } else {
        specContainer.hide();
      }
      specContainer.css('opacity', specsActive ? 1 : 0.05);
    } else {
      specContainer.show();
      specContainer.css('opacity', 0.5);
    }
  }

  function selectTab(name) {
    jquery('.tab a').removeClass('active');
    jquery('.tab.' + name + ' a').addClass('active');
    tabsMouseout();
  }
  'page,specs'.split(',').forEach(function(name) {
    jquery('.tab.' + name).click(function() {
      clickedTab = true;
      selectTab(name);
    });
  });
  selectTab('specs');
  jquery('.tabs').hover(function() {
    var specsActive = jquery('.tab.specs a').hasClass('active');
    specContainer.show();
    specContainer.css('opacity', specsActive ? 0.5 : 0.9);
  }, tabsMouseout);

  browser.ready(jquery('.frameLocation'), function() {
    runner({}, [
      uiSpecs
    ], function() {
      console.log(' - specs loaded');
      jquery('.ph-HTMLReporter').replaceWith(jquery('#HTMLReporter'));
    });
  });
});
