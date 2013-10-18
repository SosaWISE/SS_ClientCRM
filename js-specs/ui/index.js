define('spec/ui/index', [
  'jquery',
  'spec/ui/browser',
  'spec/runner',
  'spec/jasmine-ui'
], function(
  $,
  browser,
  runner
) {
  'use strict';

  var specContainer = $('.container.specs'),
    clickedTab = false;

  function tabsMouseout() {
    var specsActive = $('.tab.specs a').hasClass('active');
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
    $('.tab a').removeClass('active');
    $('.tab.' + name + ' a').addClass('active');
    tabsMouseout();
  }
  'page,specs'.split(',').forEach(function(name) {
    $('.tab.' + name).click(function() {
      clickedTab = true;
      selectTab(name);
    });
  });
  selectTab('specs');
  $('.tabs').hover(function() {
    var specsActive = $('.tab.specs a').hasClass('active');
    specContainer.show();
    specContainer.css('opacity', specsActive ? 0.5 : 0.9);
  }, tabsMouseout);

  browser.ready($('.frameLocation'), function() {
    runner({}, [
      [
        'spec/ui/spec.account.new',
      ],
    ], function() {
      console.log(' - specs loaded');
      $('.ph-HTMLReporter').replaceWith($('#HTMLReporter'));
    });
  });
});
