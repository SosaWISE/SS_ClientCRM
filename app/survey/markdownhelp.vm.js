define('src/survey/markdownhelp.vm', [
  'jquery',
  'ko',
  'src/survey/surveyhelper',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  jquery,
  ko,
  surveyhelper,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function MarkdownHelpViewModel(options) {
    var _this = this;
    MarkdownHelpViewModel.super_.call(_this, options);

    _this.inputText = ko.observable();
    _this.ouputHtml = ko.computed({
      deferEvaluation: true,
      read: function() {
        return surveyhelper.formatQuestion(
          _this.inputText(), [
            '123.4567890',
          ],
          '[missing token value]'
        );
      }
    });
  }
  utils.inherits(MarkdownHelpViewModel, BaseViewModel);
  MarkdownHelpViewModel.prototype.viewTmpl = 'tmpl-survey-markdownhelp';

  return MarkdownHelpViewModel;
});
