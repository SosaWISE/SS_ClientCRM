define('src/survey/vm.questiontranslation.editor', [
  'src/util/strings',
  'markdown',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  strings,
  markdown,
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
    var html,
      params = [];
    html = markdown.toHTML(this.input());
    this.questionMeaningVM.tokens().forEach(function(tokenMap) {
      params.push(tokenMap.token.Token);
    });
    return strings.aformat(html, params, '[missing param]');
  };

  return EditorQuestionTranslationViewModel;
});
