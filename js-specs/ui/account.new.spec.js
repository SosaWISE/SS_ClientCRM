define('spec/ui/account.new.spec', [
  'jquery',
  'spec/ui/browser'
], function(
  $,
  browser
) {
  "use strict";

  // setTimeout(function() {
  //   debugger;
  // }, 3000);


  describe('account.new', function() {
    describe('new account button', function() {
      var el;
      beforeEach(function() {
        el = browser.anchor('.accounts .tabs .tab:last-child a');
      });

      it('text should be \'+\'', function() {
        expect(el.innerText).toBe('+');
      });
      it('click should activate the tab', function() {
        browser.
        click(el).
        delay(function() {
          expect(browser.hasClass(el, 'active')).toBe(true);
        });
      });
    });
    describe('find rep', function() {
      var el;
      beforeEach(function() {
        el = browser.input('.rep-find .rep-id');
      });

      it('pressing enter should load rep by id', function() {
        browser.
        delay(function() {
          browser.setText(el, 'asdf000');
          expect(el.value).toBe('asdf000');
        }).
        delay(function() {
          browser.pressEnter(el);
          expect(el.value).toBe('ASDF000');
        }).
        delay(function() {
          var resultEl = browser.div('.rep-find .repinfo');
          expect($(resultEl)).toBeVisible();
        });
      });
    });
  });
});
