define('src/survey/vm.questiontranslation', [
  'src/core/notify',
  'src/util/utils',
  'ko',
  'src/core/vm.base',
], function(
  notify,
  utils,
  ko,
  BaseViewModel
) {
  'use strict';

  function QuestionTranslationViewModel(options) {
    var _this = this;
    QuestionTranslationViewModel.super_.call(_this, options);

    _this.LocalizationCode = _this.surveyTranslationVM.model.LocalizationCode;
  }
  utils.inherits(QuestionTranslationViewModel, BaseViewModel);
  QuestionTranslationViewModel.prototype.viewTmpl = 'tmpl-questiontranslation';

  return QuestionTranslationViewModel;
});
