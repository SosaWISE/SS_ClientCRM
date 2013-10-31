define('src/survey/vm.question', [
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
  'src/survey/vm.questiontranslation',
  'src/dataservice',
  'ko',
], function(
  notify,
  utils,
  ControllerViewModel,
  QuestionTranslationViewModel,
  dataservice,
  ko
) {
  'use strict';

  function QuestionViewModel(options) {
    var _this = this;
    QuestionViewModel.super_.call(_this, options);

    // observables
    _this.questions = ko.observableArray();
    _this.groupOrder = ko.observable(-1);
    // computed observables
    _this.translations = ko.computed(_this.computeTranslations, _this);
    _this.name = ko.computed(_this.computeName, _this);
    _this.nextName = ko.computed(_this.computeNextName, _this);
  }
  utils.inherits(QuestionViewModel, ControllerViewModel);
  QuestionViewModel.prototype.viewTmpl = 'tmpl-question';
  QuestionViewModel.prototype.parent = null;

  QuestionViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this;

    dataservice.survey.getQuestionPossibleAnswers({
      QuestionID: _this.model.QuestionID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        _this.list(resp.Value);
      }
      cb(false);
    });
  };

  QuestionViewModel.prototype.computeTranslations = function() {
    var _this = this,
      results = [],
      questionId = _this.model.QuestionID;
    _this.surveyVM.translations().forEach(function(surveyTranslationVM) {
      var vm = surveyTranslationVM.questionTranslationsMap()[questionId];
      if (!vm) {
        vm = new QuestionTranslationViewModel({
          surveyTranslationVM: surveyTranslationVM,
          model: {
            // QuestionTranslationID: 0,
            SurveyTranslationId: surveyTranslationVM.SurveyTranslationID,
            QuestionId: questionId,
            TextFormat: 'missing...',
          },
        });
      }
      results.push(vm);
    });
    return results;
  };
  QuestionViewModel.prototype.computeName = function() {
    var _this = this;
    return getName(_this.parent, _this.groupOrder());
  };
  QuestionViewModel.prototype.computeNextName = function() {
    // next child name
    var _this = this;
    return getName(_this, _this.questions().length);
  };

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + (index + 1) + '.';
  }


  return QuestionViewModel;
});
