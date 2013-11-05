define('src/survey/vm.questiontranslation', [
  'src/ukov',
  'src/dataservice',
  'src/survey/vm.questiontranslation.editor',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  ukov,
  dataservice,
  EditorQuestionTranslationViewModel,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  ukov.schema['questiontranslation-validate'] = {
    QuestionTranslationID: {},
    SurveyTranslationId: {},
    QuestionId: {},
    TextFormat: {
      converter: ukov.converters.string(),
      validators: [
        ukov.validators.isRequired('Translation is required'),
      ],
    },
  };

  function QuestionTranslationViewModel(options) {
    var _this = this;
    QuestionTranslationViewModel.super_.call(_this, options);
    _this.ensureProps(['surveyTranslationVM', 'questionVM']);

    _this.LocalizationCode = _this.surveyTranslationVM.model.LocalizationCode;

    // observables
    _this.editorVM = ko.observable(null);
    _this.saving = ko.observable(false);

    _this.qtData = ukov.wrapModel(_this.model, 'questiontranslation-validate', 'questiontranslation-validate-vm');

    delete _this.model;

    //
    // events
    //
    _this.clickEdit = function() {
      if (_this.editorVM()) {
        return;
      }
      //
      var vm = new EditorQuestionTranslationViewModel({
        input: _this.qtData.TextFormat,
        questionMeaningVM: _this.questionVM.questionMeaningVM,
      });
      _this.editorVM(vm);
    };
    _this.clickEndEdit = function() {
      if (_this.saving()) {
        return;
      }
      // reset text
      _this.qtData.TextFormat(_this.qtData.TextFormat.cleanVal());
      _this.editorVM(null);
    };
    _this.clickSave = function() {
      if (_this.saving()) {
        return;
      }
      _this.qtData.TextFormat.validate();
      _this.qtData.update();
      if (!_this.qtData.isValid()) {
        notify.notify('warn', _this.qtData.errMsg(), 10);
        return;
      }
      _this.saving(true);
      dataservice.survey.saveQuestionTranslation(_this.qtData.model, function(resp) {
        _this.saving(false);
        if (resp.Code !== 0) {
          notify.notify('error', resp.Message);
        } else {
          _this.qtData.setVal(resp.Value);
          _this.qtData.markClean(resp.Value);
          _this.editorVM(null);
        }
      });
    };
  }
  utils.inherits(QuestionTranslationViewModel, BaseViewModel);
  QuestionTranslationViewModel.prototype.viewTmpl = 'tmpl-questiontranslation';

  return QuestionTranslationViewModel;
});
