define('src/survey/vm.questiontranslation.editor', [
  'src/survey/surveyhelper',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  surveyhelper,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  function EditorQuestionTranslationViewModel(options) {
    var _this = this;
    EditorQuestionTranslationViewModel.super_.call(_this, options);
    _this.ensureProps(['questionMeaningVM', 'input']);

    // _this.input = should be passed in
    _this.output = ko.computed(_this.computeHtml, _this);
  }
  utils.inherits(EditorQuestionTranslationViewModel, BaseViewModel);
  EditorQuestionTranslationViewModel.prototype.viewTmpl = 'tmpl-questiontranslation_editor';

  EditorQuestionTranslationViewModel.prototype.computeHtml = function() {
    //@TODO: format with real & mock tokens
    var tokenValues = this.questionMeaningVM.tokenMaps().map(function(tokenMap) {
      return tokenMap.token.Token;
    });
    return surveyhelper.formatQuestion(this.input(), tokenValues, '[missing param]');
  };

  return EditorQuestionTranslationViewModel;
});
