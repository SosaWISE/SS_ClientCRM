define('src/survey/surveytype.vm', [
  'src/core/notify',
  'src/core/utils',
  'ko',
  'src/core/controller.vm',
  'src/survey/survey.new.vm',
  'src/survey/survey.vm',
  'src/survey/questionmeaning.vm',
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
    ControllerViewModel.ensureProps(_this, ['layersVm', 'tokensVM', 'possibleAnswersVM']);

    _this.id = _this.model.SurveyTypeID;
    _this.surveys = _this.childs;
    _this.questionMeanings = ko.observableArray();
    _this.qmMap = {};

    //
    // events
    //
    _this.clickAddSurvey = function() {
      _this.layersVm.show(new NewSurveyViewModel({
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

  SurveyTypeViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    loadSurveys(_this, _this.id, routeData, extraData, join);
    loadQuestionMeaning(_this, _this.id, routeData, extraData, join);
  };

  SurveyTypeViewModel.prototype.hasVersion = function(version) {
    // create case insensitive matcher
    var regx = new RegExp('^' + version + '$', 'i');
    return this.surveys().some(function(surveyVM) {
      return regx.test(surveyVM.model.Version);
    });
  };

  function loadSurveys(surveyTypeVM, surveyTypeID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveyTypes.read({
      id: surveyTypeID,
      link: 'surveys',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        var list = resp.Value.map(function(model) {
          var vm = createSurvey(surveyTypeVM, model);
          // lazy load survey data // vm.load(routeData, extraData, join.add());
          return vm;
        });
        surveyTypeVM.surveys(list);
      } else {
        surveyTypeVM.surveys([]);
      }
    }, utils.no_op));
  }

  function loadQuestionMeaning(surveyTypeVM, surveyTypeID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveyTypes.read({
      id: surveyTypeID,
      link: 'questionMeanings',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        var list = resp.Value.map(function(model) {
          var vm = createQuestionMeaning(surveyTypeVM, model);
          surveyTypeVM.qmMap[model.QuestionMeaningID] = vm;
          // lazy load survey data // vm.load(routeData, extraData, join.add());
          return vm;
        });
        surveyTypeVM.questionMeanings(list);
      } else {
        surveyTypeVM.questionMeanings([]);
      }
    }, utils.no_op));
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
      pcontroller: surveyTypeVM,
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
