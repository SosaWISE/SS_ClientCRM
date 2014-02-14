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
  'src/core/controller.vm',
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
  ControllerViewModel,
  utils
) {
  'use strict';

  function SurveyViewModel(options) {
    var _this = this;
    SurveyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['model', 'surveyTypeVM', 'tokensVM', 'possibleAnswersVM']);

    _this.title = ko.observable(_this.surveyTypeVM.model.Name + ' ' + _this.model.Version);
    _this.id = _this.model.SurveyID;

    // observables
    _this.questions = ko.observableArray();
    _this.translations = ko.observableArray();
    // computed observables
    _this.nextName = ko.computed(_this.computeNextName, _this);

    _this.layersVm = new LayersViewModel({
      controller: _this,
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
    _this.clickAddQuestion = function(parentVM) {
      var parent = (parentVM === _this) ? null : parentVM,
        vm;
      if (parent && parent.noAddSubQuestion()) {
        return;
      }
      vm = new NewQuestionViewModel({
        surveyVM: _this,
        surveyTypeVM: _this.surveyTypeVM,
        parent: parent,
        nextName: parentVM.nextName(),
        groupOrder: parentVM.nextGroupOrder(),
      });
      _this.layersVm.show(vm, function(model) {
        if (!model) {
          return;
        }
        model.childs = [];
        var vm = createQuestion(_this, model, parent);
        // make sure it is loaded
        vm.load({}, null, function(errResp) {
          if (errResp) {
            return notify.notify('error', errResp.Message);
          }
          parentVM.questions.push(vm);
        });
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
    _this.clickTakeSurvey = function() {
      _this.layersVm.show(new TakeSurveyTranslationViewModel({
        surveyTranslationVMs: _this.translations(),
        routeData: {
          surveyid: _this.id,
          // locale: 'en',
        },
      }));
    };
  }
  utils.inherits(SurveyViewModel, ControllerViewModel);
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

  function loadQuestions(surveyVM, surveyID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'questions',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          var treeTrunk = treehelper.makeTree(resp.Value, 'QuestionID', 'ParentId', function(model, parentVM /*, parent*/ ) {
            var vm = createQuestion(surveyVM, model, parentVM);
            vm.load(routeData, extraData, join.add());
            return vm;
          });
          surveyVM.questions(treeTrunk);
        } else {
          surveyVM.questions([]);
        }
      }, cb);
    });
  }

  function loadSurveyTranslations(surveyVM, surveyID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'surveyTranslations',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
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
      }, cb);
    });
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

  SurveyViewModel.prototype.computeNextName = function() {
    return this.nextGroupOrder() + '.';
  };

  SurveyViewModel.prototype.nextGroupOrder = function() {
    return this.questions().length + 1;
  };

  function createQuestion(surveyVM, model, parent) {
    return new QuestionViewModel({
      surveyVM: surveyVM,
      possibleAnswersVM: surveyVM.possibleAnswersVM,
      questionMeaningVM: surveyVM.surveyTypeVM.getQuestionMeaning(model.QuestionMeaningId),
      model: model,
      parent: parent,
    });
  }

  function createSurveyTranslation(surveyVM, model) {
    return new SurveyTranslationViewModel({
      surveyVM: surveyVM,
      model: model,
    });
  }

  return SurveyViewModel;
});
