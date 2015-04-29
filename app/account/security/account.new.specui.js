/* global describe,it,expect,beforeEach */
define('src/account/security/account.new.specui', [
  'jquery',
  'specui/browser'
], function(
  jquery,
  browser
) {
  "use strict";

  function addQualifyTab() {
    return browser.anchor('.panels > .active .accounts .fh-header .tabs .tab:last-child a');
  }

  function qualifyTab() {
    return browser.anchor('.panels > .active .accounts .fh-header .tabs .tab:nth-last-child(2) a');
  }

  function companyIdInput() {
    return browser.input('.panels > .active .accounts .fh-body .layers:last-child .rep-find .rep-id');
  }

  function resultsDiv() {
    return browser.div('.panels > .active .accounts .fh-body .layers:last-child .rep-find .repinfo');
  }

  // window.setTimeout(function() {
  //   debugger;
  // }, 3000);

  describe('account.new', function() {
    describe('new account button', function() {
      var tabEl;
      beforeEach(function() {
        tabEl = addQualifyTab();
      });

      it('text should be \'+\'', function() {
        expect(tabEl.innerText).toBe('+');
      });
      it('click should create a new qualify tab and activate it', function() {
        browser.
        click(tabEl).
        delay(function() {
          var newTabEl = qualifyTab();
          expect(newTabEl.innerText).toBe('Qualify 1');
          expect(browser.hasClass(newTabEl, 'active')).toBe(true);
        });
      });
    });
    describe('find rep', function() {
      var el;
      beforeEach(function() {
        el = companyIdInput();
      });

      it('should validate rep id', function() {
        browser.
        delay(function() {
          browser.setText(el, 'sosa001');
          expect(el.value).toBe('sosa001');
        });
      });

      it('pressing enter should load rep by id', function() {
        browser.
        delay(function() {
          browser.pressEnter(el);
          expect(el.value).toBe('SOSA001');
        }).
        delay(function() {
          var resultEl = resultsDiv();
          expect(jquery(resultEl)).toBeVisible();
        });
      });
    });
  });
});
