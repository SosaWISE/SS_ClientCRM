define('src/survey/vm.survey', [
  'src/survey/vm.takesurvey',
  'src/util/joiner',
  'src/core/vm.layers',
  'src/survey/vm.qpossibleanswermap.new',
  'src/survey/vm.qmtokenmap.new',
  'src/survey/vm.question',
  'src/survey/vm.question.new',
  'src/survey/vm.surveytranslation',
  'src/survey/vm.surveytranslation.new',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/vm.controller',
  'src/util/utils',
], function(
  TakeSurveyViewModel,
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
    _this.ensureProps(['surveyTypeVM', 'tokensVM', 'possibleAnswersVM']);

    _this.title = ko.observable(_this.title);
    _this.id = _this.model.SurveyID;

    // observables
    _this.questions = ko.observableArray();
    _this.translations = ko.observableArray();
    // computed observables
    _this.nextName = ko.computed(_this.computeNextName, _this);

    _this.layersVM = new LayersViewModel();

    //
    // events
    //
    _this.clickAddSurveyTranslation = function() {
      _this.layersVM.show(new NewSurveyTranslationViewModel({
        surveyVM: _this,
      }), function(model) {
        if (!model) {
          return;
        }
        var vm = createSurveyTranslation(_this, model);
        _this.translations.push(vm);
        vm.active(true);
      });
    };
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
        // make sure it is loaded
        vm.load({}, function(errResp) {
          if (errResp) {
            return notify.notify('error', errResp.Message);
          }
          parentVM.questions.push(vm);
        });
      });
    };
    _this.clickAddToken = function(vm) {
      _this.layersVM.show(new NewQMTokenMapViewModel({
        questionMeaningVM: vm,
        tokensVM: _this.tokensVM,
      }));
    };
    _this.clickAddPossibleAnswer = function(vm) {
      _this.layersVM.show(new NewQPossibleAnswerMapViewModel({
        questionVM: vm,
        possibleAnswersVM: _this.possibleAnswersVM,
      }));
    };
    _this.clickTakeSurvey = function() {
      var vm = new TakeSurveyViewModel({
        tokensVM: _this.tokensVM,
        possibleAnswersVM: _this.possibleAnswersVM,
        tokenData: {
          CompanyName: 'CompanyName',
          ADUserDisplayName: 'ADUserDisplayName',
          PrimaryCustomer: {
            Name: 'Bob',
            LastName: 'Bobbins',
          },
          PremiseAddress: {
            Street: '111 Technology Way',
            City: 'Orem',
            State: 'UT',
            Zip: '84059',
          },
          SystemDetails: {
            PremisePhone: 'PremisePhone',
          },
        },
      });
      vm.activate(_this.createRouteContext({
        // route: 'surveys',
        surveyid: _this.id,
        locale: 'en',
      }));
      _this.layersVM.show(vm);
    };
  }
  utils.inherits(SurveyViewModel, ControllerViewModel);
  SurveyViewModel.prototype.routePart = 'surveyid';
  SurveyViewModel.prototype.viewTmpl = 'tmpl-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;

    loadQuestions(_this, _this.id, routeData, join);
    loadSurveyTranslations(_this, _this.id, routeData, join);

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

  function loadQuestions(surveyVM, surveyID, routeData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'questions',
    }, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      var list = resp.Value.map(function(item) {
        var vm = createQuestion(surveyVM, null, item);
        vm.load(routeData, join.add());
        return vm;
      });
      surveyVM.questions(makeTree(list));
      cb();
    });
  }

  function loadSurveyTranslations(surveyVM, surveyID, routeData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'surveyTranslations',
    }, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      var list = resp.Value.map(function(model) {
        var vm = createSurveyTranslation(surveyVM, model);
        // lazy load survey translation data // vm.load(routeData, join.add());
        return vm;
      });
      surveyVM.translations(list);
      cb();
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
        // start recursion
        item.questions(makeTree(list, item));
      }
    });
    return branch;
  }

  function createQuestion(surveyVM, parent, model) {
    return new QuestionViewModel({
      surveyVM: surveyVM,
      possibleAnswersVM: surveyVM.possibleAnswersVM,
      questionMeaningVM: surveyVM.surveyTypeVM.getQuestionMeaning(model.QuestionMeaningId),
      parent: parent,
      model: model,
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
