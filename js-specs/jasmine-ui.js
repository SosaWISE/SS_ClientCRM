define('spec/jasmine-ui', [
  'jquery'
], function($) {
  'use strict';

  var classMatchers = {},
    jqueryMatchers = {
      toBe: function(selector) {
        return this.actual.is(selector);
      },
      toBeDisabled: function() {
        return this.actual.is(':disabled');
      },
      toBeVisible: function() {
        return this.actual.is(':visible');
      },
      toBeHidden: function() {
        return this.actual.is(':hidden');
      },
      toBeSelected: function() {
        return this.actual.is(':selected');
      },
      toBeChecked: function() {
        return this.actual.is(':checked');
      },
      toBeEmpty: function() {
        return this.actual.is(':empty');
      },
      toBeMatchedBy: function(selector) {
        return this.actual.filter(selector).length;
      },
      toBeFocused: function() {
        return this.actual[0] === this.actual[0].ownerDocument.activeElement;
      },
      toExist: function() {
        return this.actual.length;
      },
      toHaveLength: function(length) {
        return this.actual.length === length;
      },
      toHaveAttr: function(attributeName, expectedAttributeValue) {
        return hasProperty(this.actual.attr(attributeName), expectedAttributeValue);
      },
      toHaveProp: function(propertyName, expectedPropertyValue) {
        return hasProperty(this.actual.prop(propertyName), expectedPropertyValue);
      },
      toHaveId: function(id) {
        return this.actual.attr('id') === id;
      },
      toHaveHtml: function(html) {
        return this.actual.html() === browserFormattedHtml(html);
      },
      toHaveText: function(text) {
        var trimmedText = $.trim(this.actual.text());
        if (text && $.isFunction(text.test)) {
          return text.test(trimmedText);
        } else {
          return trimmedText === text;
        }
      },
      toHaveValue: function(value) {
        return this.actual.val() === value;
      },
      toHaveData: function(key, expectedValue) {
        return hasProperty(this.actual.data(key), expectedValue);
      },
      toHaveClass: function(className) {
        return this.actual.hasClass(className);
      },
      toHaveCss: function(css) {
        return !Object.forEach(css).some(function(name) {
          var value = css[name];
          // see issue #147 on gh
          if (value === 'auto' && this.actual.get(0).style[name] === 'auto') {
            return false;
          } else if (this.actual.css(name) !== value) {
            // break out of loop
            return true;
          }
          return false;
        });
      },

      toContain: function(selector) {
        return this.actual.find(selector).length;
      },
      toContainText: function(text) {
        var trimmedText = $.trim(this.actual.text());
        if (text && $.isFunction(text.test)) {
          return text.test(trimmedText);
        } else {
          return trimmedText.indexOf(text) !== -1;
        }
      },
      toContainHtml: function(html) {
        var actualHtml = this.actual.html(),
          expectedHtml = browserFormattedHtml(html);
        return (actualHtml.indexOf(expectedHtml) > -1);
      },
    };

  function browserFormattedHtml(html) {
    return $('<div/>').append(html).html();
  }

  function hasProperty(actualValue, expectedValue) {
    if (expectedValue === undefined) {
      return actualValue !== undefined;
    }
    return actualValue === expectedValue;
  }

  Object.keys(jqueryMatchers).forEach(function(methodName) {
    var matcher = jqueryMatchers[methodName],
      jasmineMatcher = jasmine.Matchers.prototype[methodName];

    classMatchers[methodName] = function() {
      if (this.actual instanceof $) {
        var result = matcher.apply(this, arguments);
        this.actual = $('<div/>').append(this.actual.clone()).html();
        return result;
      }

      if (jasmineMatcher) {
        return jasmineMatcher.apply(this, arguments);
      }

      return false;
    };
  });

  beforeEach(function() {
    this.addMatchers(classMatchers);
  });
  // afterEach(function() {});
});
