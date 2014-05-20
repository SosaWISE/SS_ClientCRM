define('src/survey/survey.vm', [
  'src/core/treehelper',
  'src/survey/takesurveytranslation.vm',
  'src/core/joiner',
  'src/core/layers.vm',
  'src/survey/qpossibleanswermap.new.vm',
  'src/survey/qmtokenmap.new.vm',
  'src/survey/question.vm',
  'src/survey/question.new.vm',
  'src/survey/surveytranslation.vm',
  'src/survey/surveytranslation.new.vm',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/survey/questions.parent.vm', //'src/core/controller.vm',
  'src/core/utils',
], function(
  treehelper,
  TakeSurveyTranslationViewModel,
  joiner,
  LayersViewModel,
  NewQPossibleAnswerMapViewModel,
  NewQMTokenMapViewModel,
  QuestionViewModel,
  NewQuestionViewModel,
  SurveyTranslationViewModel,
  NewSurveyTranslationViewModel,
  dataservice,
  ko,
  notify,
  QuestionsParentViewModel,
  utils
) {
  'use strict';

  function SurveyViewModel(options) {
    var _this = this;
    SurveyViewModel.super_.call(_this, options);
    QuestionsParentViewModel.ensureProps(_this, ['model', 'surveyTypeVM', 'tokensVM', 'possibleAnswersVM']);

    _this.title = ko.observable(_this.surveyTypeVM.model.Name + ' ' + _this.model.Version);
    _this.id = _this.model.SurveyID;

    // observables
    _this.translations = ko.observableArray();

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.takeVm = new TakeSurveyTranslationViewModel({
      layersVm: _this.layersVm,
      surveyTranslationVMs: _this.translations(),
      surveyid: _this.id,
    });
    _this.translations.subscribe(function(vms) {
      _this.takeVm.updateSurveyTranslations(vms);
    });

    //
    // events
    //
    _this.clickAddSurveyTranslation = function() {
      _this.layersVm.show(new NewSurveyTranslationViewModel({
        surveyVM: _this,
      }), function(model) {
        if (!model) {
          return;
        }
        var vm = createSurveyTranslation(_this, model);
        _this.translations.push(vm);
        if (!vm.active()) {
          vm.cmdToggle.execute();
        }
      });
    };
    _this.clickAddToken = function(vm) {
      _this.layersVm.show(new NewQMTokenMapViewModel({
        questionMeaningVM: vm,
        tokensVM: _this.tokensVM,
      }));
    };
    _this.clickAddPossibleAnswer = function(vm) {
      _this.layersVm.show(new NewQPossibleAnswerMapViewModel({
        questionVM: vm,
        possibleAnswersVM: _this.possibleAnswersVM,
      }));
    };
    _this.clickTakeSurvey = _this.takeVm.clickTake;

    _this.clickAddQuestion = function(parentVM) {
      var parent = (parentVM === _this.topVm) ? null : parentVM;
      newQuestion(_this, parent);
    };
  }
  utils.inherits(SurveyViewModel, QuestionsParentViewModel);
  SurveyViewModel.prototype.routePart = 'surveyid';
  SurveyViewModel.prototype.viewTmpl = 'tmpl-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    loadQuestions(_this, _this.id, routeData, extraData, join);
    loadSurveyTranslations(_this, _this.id, routeData, extraData, join);

    join.when(function() {
      var translations = _this.translations(),
        locale = routeData.locale;
      if (translations.length && locale) {
        // load and activate question translations for survey translation
        translations.some(function(surveyTranslationVM) {
          if (surveyTranslationVM.model.LocalizationCode === locale) {
            surveyTranslationVM.cmdToggle.execute();
            return true;
          }
        });
      }
    });
  };

  SurveyViewModel.prototype.addQuestion = QuestionViewModel.prototype.addQuestion;

  function loadQuestions(surveyVM, surveyID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'questions',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        // var treeTrunk =
        treehelper.makeTree(resp.Value, 'QuestionID', 'ParentId', function(model, parentVM /*, parent*/ ) {
          // var vm = QuestionsParentViewModel.createQuestion(surveyVM, model, parentVM);
          // vm.load(routeData, extraData, join.add());
          parentVM = parentVM || surveyVM;

          var vm = parentVM.addQuestion(surveyVM, model, parentVM, join.add());
          return vm;
        });
        // surveyVM.setQuestions(treeTrunk);
      } else {
        // surveyVM.setQuestions([]);
      }
    }, utils.no_op));
  }

  function loadSurveyTranslations(surveyVM, surveyID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'surveyTranslations',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        var list = resp.Value.map(function(model) {
          var vm = createSurveyTranslation(surveyVM, model);
          // lazy load survey translation data // vm.load(routeData, extraData, join.add());
          return vm;
        });
        surveyVM.translations(list);
      } else {
        surveyVM.translations([]);
      }
    }, utils.no_op));
  }

  SurveyViewModel.prototype.onActivate = function() { // overrides base
    // do nothing
  };

  SurveyViewModel.prototype.hasLocalizationCode = function(localizationCode) {
    // create case insensitive matcher
    var regx = new RegExp('^' + localizationCode + '$', 'i');
    return this.translations().some(function(surveyTranslationVM) {
      return regx.test(surveyTranslationVM.model.LocalizationCode);
    });
  };

  // SurveyViewModel.prototype.computeNextName = function() {
  //   return this.nextGroupOrder() + '.';
  // };
  //
  // SurveyViewModel.prototype.nextGroupOrder = function() {
  //   return this.questions().length + 1;
  // };
  //
  // function createQuestion(surveyVM, model, parent) {
  //   return new QuestionViewModel({
  //     surveyVM: surveyVM,
  //     possibleAnswersVM: surveyVM.possibleAnswersVM,
  //     questionMeaningVM: surveyVM.surveyTypeVM.getQuestionMeaning(model.QuestionMeaningId),
  //     model: model,
  //     parent: parent,
  //   });
  // }

  function createSurveyTranslation(surveyVM, model) {
    return new SurveyTranslationViewModel({
      surveyVM: surveyVM,
      model: model,
    });
  }

  function newQuestion(surveyVM, parentVm) {
    var vm;
    if (parentVm && parentVm.noAddSubQuestion()) {
      return;
    }
    vm = new NewQuestionViewModel({
      surveyVM: surveyVM,
      surveyTypeVM: surveyVM.surveyTypeVM,
      tokensVM: surveyVM.tokensVM,
      parent: parentVm,
      nextName: parentVm.nextName(),
      groupOrder: parentVm.nextGroupOrder(),
    });
    surveyVM.layersVm.show(vm, function(model) {
      if (!model) {
        return;
      }
      parentVm.addQuestion(surveyVM, model, parentVm);
    });
  }

  return SurveyViewModel;
});
