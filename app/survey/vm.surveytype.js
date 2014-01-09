define('src/survey/vm.surveytype', [
  'src/core/notify',
  'src/core/utils',
  'ko',
  'src/core/vm.controller',
  'src/survey/vm.survey.new',
  'src/survey/vm.survey',
  'src/survey/vm.questionmeaning',
  'src/dataservice',
], function(
  notify,
  utils,
  ko,
  ControllerViewModel,
  NewSurveyViewModel,
  SurveyViewModel,
  QuestionMeaningViewModel,
  dataservice
) {
  'use strict';

  function SurveyTypeViewModel(options) {
    var _this = this;
    SurveyTypeViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(this, ['layersVM', 'tokensVM', 'possibleAnswersVM']);

    _this.id = _this.model.SurveyTypeID;
    _this.surveys = _this.childs;
    _this.questionMeanings = ko.observableArray();
    _this.qmMap = {};

    //
    // events
    //
    _this.clickAddSurvey = function() {
      _this.layersVM.show(new NewSurveyViewModel({
        surveyTypeVM: _this,
      }), function(model) {
        if (!model) {
          return;
        }
        _this.surveys.push(createSurvey(_this, model));
      });
    };
  }
  utils.inherits(SurveyTypeViewModel, ControllerViewModel);
  SurveyTypeViewModel.prototype.routePart = null;
  // SurveyTypeViewModel.prototype.viewTmpl = 'tmpl-surveytype';

  SurveyTypeViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;
    loadSurveys(_this, _this.id, routeData, join);
    loadQuestionMeaning(_this, _this.id, routeData, join);
  };

  SurveyTypeViewModel.prototype.hasVersion = function(version) {
    // create case insensitive matcher
    var regx = new RegExp('^' + version + '$', 'i');
    return this.surveys().some(function(surveyVM) {
      return regx.test(surveyVM.model.Version);
    });
  };

  function loadSurveys(surveyTypeVM, surveyTypeID, routeData, join) {
    var cb = join.add();
    dataservice.survey.surveyTypes.read({
      id: surveyTypeID,
      link: 'surveys',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          var list = resp.Value.map(function(model) {
            var vm = createSurvey(surveyTypeVM, model);
            // lazy load survey data // vm.load(routeData, join.add());
            return vm;
          });
          surveyTypeVM.surveys(list);
        } else {
          surveyTypeVM.surveys([]);
        }
      }, cb);
    });
  }

  function loadQuestionMeaning(surveyTypeVM, surveyTypeID, routeData, join) {
    var cb = join.add();
    dataservice.survey.surveyTypes.read({
      id: surveyTypeID,
      link: 'questionMeanings',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          var list = resp.Value.map(function(model) {
            var vm = createQuestionMeaning(surveyTypeVM, model);
            surveyTypeVM.qmMap[model.QuestionMeaningID] = vm;
            vm.load(routeData, join.add());
            return vm;
          });
          surveyTypeVM.questionMeanings(list);
        } else {
          surveyTypeVM.questionMeanings([]);
        }
      }, cb);
    });
  }

  SurveyTypeViewModel.prototype.addQuestionMeaning = function(model) {
    var _this = this,
      id = model.QuestionMeaningID,
      vm;
    if (_this.qmMap[id]) {
      return;
    }
    vm = createQuestionMeaning(_this, model);
    _this.qmMap[id] = vm;
    _this.questionMeanings.push(vm);
    return vm;
  };

  SurveyTypeViewModel.prototype.getQuestionMeaning = function(questionMeaningId) {
    var result = this.qmMap[questionMeaningId];
    if (!result) {
      console.error('no questionmeaning for', questionMeaningId);
    }
    return result;
  };

  function createSurvey(surveyTypeVM, model) {
    return new SurveyViewModel({
      pcontroller: surveyTypeVM.pcontroller,
      routePart: surveyTypeVM.routePart,
      surveyTypeVM: surveyTypeVM,
      tokensVM: surveyTypeVM.tokensVM,
      possibleAnswersVM: surveyTypeVM.possibleAnswersVM,
      model: model,
    });
  }

  function createQuestionMeaning(surveyTypeVM, model) {
    return new QuestionMeaningViewModel({
      tokensVM: surveyTypeVM.tokensVM,
      model: model,
    });
  }

  return SurveyTypeViewModel;
});
