define('src/survey/vm.question', [
  'src/survey/vm.qpossibleanswermap',
  'src/survey/vm.questiontranslation',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
], function(
  QPossibleAnswerMapViewModel,
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
    _this.ensureProps(['surveyVM', 'possibleAnswersVM', 'questionMeaningVM']);

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

    dataservice.survey.getQuestionPossibleAnswerMaps({
      QuestionID: _this.model.QuestionID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(createPossibleAnswerMap(_this.possibleAnswersVM, item));
        });
        _this.list(list);
      }
      cb(false);
    });
  };

  QuestionViewModel.prototype.computeTranslations = function() {
    var _this = this,
      results = [],
      questionId = _this.model.QuestionID;
    _this.surveyVM.translations().forEach(function(surveyTranslationVM) {
      var list = surveyTranslationVM.list(),
        map = surveyTranslationVM.map,
        vm;
      // create map cache if there isn't one
      if (!map) {
        surveyTranslationVM.map = map = {};
        list.forEach(function(model) {
          map[model.QuestionId] = createQuestionTranslation(_this, surveyTranslationVM, model);
        });
      }
      // get question translation
      vm = map[questionId];
      // create empty question translation
      if (!vm) {
        map[questionId] = vm = createQuestionTranslation(_this, surveyTranslationVM, {
          // QuestionTranslationID: 0,
          SurveyTranslationId: surveyTranslationVM.model.SurveyTranslationID,
          QuestionId: questionId,
          TextFormat: 'missing...',
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


  QuestionViewModel.prototype.addPossibleAnswerMap = function(model) {
    var _this = this;
    _this.list.push(createPossibleAnswerMap(_this.possibleAnswersVM, model));
  };

  function createPossibleAnswerMap(possibleAnswersVM, model) {
    return new QPossibleAnswerMapViewModel({
      possibleAnswersVM: possibleAnswersVM,
      model: model,
    });
  }

  function createQuestionTranslation(questionVM, surveyTranslationVM, model) {
    return new QuestionTranslationViewModel({
      questionVM: questionVM,
      surveyTranslationVM: surveyTranslationVM,
      model: model,
    });
  }

  return QuestionViewModel;
});
