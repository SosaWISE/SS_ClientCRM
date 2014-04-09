define('src/survey/questiontranslation.editor.vm', [
  'src/survey/surveyhelper',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  surveyhelper,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  function QuestionTranslationEditorViewModel(options) {
    var _this = this;
    QuestionTranslationEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['questionMeaningVM', 'input']);

    // _this.input = should be passed in
    _this.output = ko.computed(_this.computeHtml, _this);
  }
  utils.inherits(QuestionTranslationEditorViewModel, BaseViewModel);
  QuestionTranslationEditorViewModel.prototype.viewTmpl = 'tmpl-questiontranslation_editor';

  QuestionTranslationEditorViewModel.prototype.computeHtml = function() {
    //@TODO: format with real & mock tokens
    var tokenValues = this.questionMeaningVM.tokenMaps().map(function(tokenMap) {
      return tokenMap.token.Token;
    });
    return surveyhelper.formatQuestion(this.input(), tokenValues, '[missing param]');
  };

  return QuestionTranslationEditorViewModel;
});
