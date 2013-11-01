define('src/survey/vm.question', [
  'src/survey/vm.questiontranslation',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
], function(
  QuestionTranslationViewModel,
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function QuestionViewModel(options) {
    var _this = this;
    QuestionViewModel.super_.call(_this, options);

    // observables
    _this.parent = ko.observable(_this.parent);
    _this.groupOrder = ko.observable(_this.model.GroupOrder);
    _this.questions = ko.observableArray();
    // computed observables
    _this.translations = ko.computed(_this.computeTranslations, _this);
    _this.name = ko.computed(_this.computeName, _this);
    _this.nextName = ko.computed(_this.computeNextName, _this);
  }
  utils.inherits(QuestionViewModel, ControllerViewModel);
  QuestionViewModel.prototype.viewTmpl = 'tmpl-question';

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
      var map = surveyTranslationVM.questionTranslationsMap(),
        vm = map[questionId];
      if (!vm) {
        map[questionId] = vm = new QuestionTranslationViewModel({
          surveyTranslationVM: surveyTranslationVM,
          model: {
            // QuestionTranslationID: 0,
            SurveyTranslationId: surveyTranslationVM.model.SurveyTranslationID,
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
    return getName(_this.parent(), _this.groupOrder());
  };
  QuestionViewModel.prototype.computeNextName = function() {
    // next child name
    var _this = this;
    return getName(_this, _this.nextGroupOrder());
  };

  QuestionViewModel.prototype.nextGroupOrder = function() {
    return this.questions().length;
  };

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + (index + 1) + '.';
  }


  return QuestionViewModel;
});
