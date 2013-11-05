define('src/survey/vm.survey', [
  'src/util/joiner',
  'src/core/vm.layers',
  'src/survey/vm.qpossibleanswermap.new',
  'src/survey/vm.questionmeaning',
  'src/survey/vm.qmtokenmap.new',
  'src/survey/vm.question',
  'src/survey/vm.question.new',
  'src/survey/vm.surveytranslation',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/vm.controller',
  'src/util/utils',
], function(
  joiner,
  LayersViewModel,
  NewQPossibleAnswerMapViewModel,
  QuestionMeaningViewModel,
  NewQMTokenMapViewModel,
  QuestionViewModel,
  NewQuestionViewModel,
  SurveyTranslationViewModel,
  dataservice,
  ko,
  notify,
  ControllerViewModel,
  utils
) {
  'use strict';

  function SurveyViewModel(options) {
    var _this = this;
    SurveyViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);

    // observables
    _this.questions = ko.observableArray();
    _this.translations = ko.observableArray();
    // computed observables
    _this.translationsCss = ko.computed(_this.computeTranslationsCss, _this);
    _this.nextName = ko.computed(_this.computeNextName, _this);


    _this.layersVM = new LayersViewModel();

    //
    // events
    //
    _this.clickAddQuestion = function(parentVM) {
      var parent = (parentVM === _this) ? null : parentVM,
        vm = new NewQuestionViewModel({
          surveyVM: _this,
          surveyTypeVM: _this.surveyTypeVM,
          parent: parent,
          nextName: parentVM.nextName(),
          groupOrder: parentVM.nextGroupOrder(),
        });
      _this.layersVM.show(vm, function(model) {
        if (!model) {
          return;
        }
        var vm = createQuestion(_this, parent, model);
        _this.list.push(vm);
        parentVM.questions.push(vm);
      });
    };
    _this.clickAddToken = function(vm) {
      if (!(vm instanceof QuestionMeaningViewModel)) {
        throw new Error('vm is wrong type');
      }
      _this.layersVM.show(new NewQMTokenMapViewModel({
        questionMeaningVM: vm,
        tokensVM: _this.surveyTypeVM.tokensVM,
      }));
    };
    _this.clickAddPossibleAnswer = function(vm) {
      if (!(vm instanceof QuestionViewModel)) {
        throw new Error('vm is wrong type');
      }
      _this.layersVM.show(new NewQPossibleAnswerMapViewModel({
        questionVM: vm,
        possibleAnswersVM: _this.possibleAnswersVM,
      }));
    };
  }
  utils.inherits(SurveyViewModel, ControllerViewModel);
  SurveyViewModel.prototype.viewTmpl = 'tmpl-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this,
      childList = [],
      join = joiner(),
      jList = [];

    jList.push(join.add());
    dataservice.survey.getQuestions({
      SurveyID: _this.model.SurveyID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(createQuestion(_this, null, item));
        });
        _this.questions(makeTree(list));
        // _this.list(list);
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    jList.push(join.add());
    dataservice.survey.getSurveyTranslations({
      SurveyID: _this.model.SurveyID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(new SurveyTranslationViewModel({
            model: item,
          }));
        });
        _this.translations(list);
        //
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    join.when(function() {
      // activate english
      _this.translations().some(function(item) {
        if (item.model.LocalizationCode === 'en') {
          item.active(true);
          return true;
        }
      });

      _this.list(childList);
      cb(true);
    });
  };

  SurveyViewModel.prototype.computeTranslationsCss = function() {
    var results = [];
    this.translations().forEach(function(surveyTranslationVM) {
      if (surveyTranslationVM.active()) {
        results.push('show-' + surveyTranslationVM.model.LocalizationCode);
      }
    });
    return results.join(' ');
  };
  SurveyViewModel.prototype.computeNextName = function() {
    return (this.nextGroupOrder() + 1) + '.';
  };

  SurveyViewModel.prototype.nextGroupOrder = function() {
    return this.questions().length;
  };

  function makeTree(list, parent) {
    var branch = [];
    list.forEach(function(item) {
      if (
        (parent && item.model.ParentId === parent.model.QuestionID) ||
        (!parent && item.model.ParentId == null)
      ) {
        item.parent(parent);
        branch.push(item);
        // begin recursion
        item.questions(makeTree(list, item));
      }
    });
    return branch;
  }

  function createQuestion(surveyVM, parent, model) {
    return new QuestionViewModel({
      possibleAnswersVM: surveyVM.possibleAnswersVM,
      surveyVM: surveyVM,
      parent: parent,
      model: model,
      questionMeaningVM: surveyVM.surveyTypeVM.getQuestionMeaning(model.QuestionMeaningId),
    });
  }

  return SurveyViewModel;
});
