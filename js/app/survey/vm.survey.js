define('src/survey/vm.survey', [
  'src/util/joiner',
  'src/core/vm.layers',
  'src/survey/vm.qpossibleanswermap.new',
  'src/survey/vm.questionmeaning',
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
  joiner,
  LayersViewModel,
  NewQPossibleAnswerMapViewModel,
  QuestionMeaningViewModel,
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
    _this.ensureProps(['surveyTypeVM', 'possibleAnswersVM']);

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
  SurveyViewModel.prototype.routePart = 'surveyid';
  SurveyViewModel.prototype.viewTmpl = 'tmpl-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;

    loadQuestions(_this, routeData, join);
    loadSurveyTranslations(_this, routeData, join);

    join.when(function() {
      // activate english
      _this.translations().some(function(item) {
        if (item.model.LocalizationCode === 'en') {
          item.active(true);
          return true;
        }
      });
    });
  };

  function loadQuestions(_this, routeData, join) {
    var cb = join.add();
    dataservice.survey.getQuestions({
      SurveyID: _this.model.SurveyID,
    }, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      var list = resp.Value.map(function(item) {
        var vm = createQuestion(_this, null, item);
        vm.load(routeData, join.add());
        return vm;
      });
      // // wait for everything to be loaded before setting
      // join.when(function() {
      _this.questions(makeTree(list));
      // });
      cb();
    });
  }

  function loadSurveyTranslations(_this, routeData, join) {
    var cb = join.add();
    dataservice.survey.getSurveyTranslations({
      SurveyID: _this.model.SurveyID,
    }, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      var list = resp.Value.map(function(model) {
        var vm = createSurveyTranslation(_this, model);
        vm.load(routeData, join.add());
        return vm;
      });
      _this.translations(list);
      cb();
    });
  }

  SurveyViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
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
