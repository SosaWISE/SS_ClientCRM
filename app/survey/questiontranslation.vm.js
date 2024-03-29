define('src/survey/questiontranslation.vm', [
  'src/ukov',
  'src/dataservice',
  'src/survey/questiontranslation.editor.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ukov,
  dataservice,
  QuestionTranslationEditorViewModel,
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
    BaseViewModel.ensureProps(_this, ['surveyTranslationVM', 'questionVM']);

    _this.LocalizationCode = _this.surveyTranslationVM.model.LocalizationCode;

    // observables
    _this.editorVM = ko.observable(null);
    // computed observables
    _this.show = ko.computed({
      // do not evaluate until someone requests the value,
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
    _this.cmdEdit = ko.command(function(cb) {
      if (_this.editorVM()) {
        cb();
        return;
      }
      //
      var vm = new QuestionTranslationEditorViewModel({
        input: _this.qtData.TextFormat,
        questionMeaningVM: _this.questionVM.questionMeaningVM,
      });
      _this.editorVM(vm);
      cb();
    }, function(busy) {
      return !busy && !_this.surveyTranslationVM.surveyVM.isReadonly();
    });
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
        notify.warn(_this.qtData.errMsg(), null, 10);
        return cb();
      }
      dataservice.survey.questionTranslations.save({
        id: _this.qtData.model.QuestionTranslationID || "", // null or undefined if new
        data: _this.qtData.model,
      }, null, function(err, resp) {
        if (err) {
          notify.error(err);
        } else {
          _this.qtData.setValue(resp.Value);
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
