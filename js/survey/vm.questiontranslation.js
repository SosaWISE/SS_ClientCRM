define('src/survey/vm.questiontranslation', [
  'src/ukov',
  'src/dataservice',
  'src/survey/vm.questiontranslation.editor',
  'ko',
  'src/core/notify',
  'src/core/utils',
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

  var schema = {
    _model: true,
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
    // computed observables
    _this.show = ko.computed({
      // don't evaluate until someone requests the value,
      // since this vm is created inside of another computed
      deferEvaluation: true,
      read: function() {
        return this.active();
      },
    }, _this.surveyTranslationVM);

    _this.qtData = ukov.wrap(_this.model, schema);

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
    _this.clickEndEdit = function(force) {
      if (!force && _this.cmdSave.busy()) {
        return;
      }
      // reset text
      _this.qtData.TextFormat(_this.qtData.TextFormat.cleanVal());
      _this.editorVM(null);
    };
    _this.cmdSave = ko.command(function(cb) {
      _this.qtData.TextFormat.validate();
      _this.qtData.update();
      if (!_this.qtData.isValid()) {
        notify.notify('warn', _this.qtData.errMsg(), 10);
        return cb();
      }
      dataservice.survey.questionTranslations.save(_this.qtData.model, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
        } else {
          _this.qtData.setVal(resp.Value);
          _this.qtData.markClean(resp.Value);
          _this.clickEndEdit(true);
        }
        cb();
      });
    });
  }
  utils.inherits(QuestionTranslationViewModel, BaseViewModel);
  QuestionTranslationViewModel.prototype.viewTmpl = 'tmpl-questiontranslation';

  return QuestionTranslationViewModel;
});
