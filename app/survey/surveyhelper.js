define('src/survey/surveyhelper', [
  'src/core/strings',
  'markdown',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  strings,
  markdown
) {
  'use strict';

  return {
    formatQuestion: function(textFormat, tokenValues, missingParamFormat) {
      var html = markdown.toHTML(textFormat);
      return strings.aformat(html, tokenValues, missingParamFormat);
    },

    questionsSorter: function(a, b) {
      return a.GroupOrder - b.GroupOrder;
    },
  };
});
