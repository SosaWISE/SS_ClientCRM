define('src/survey/surveyhelper', [
  'src/core/strings',
  'markdown',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.base',
], function(
  strings,
  markdown
) {
  'use strict';

  return {
    formatQuestion: function(textFormat, tokenValues, missingParamText) {
      var html = markdown.toHTML(textFormat);
      return strings.aformat(html, tokenValues, missingParamText);
    },
  };
});
