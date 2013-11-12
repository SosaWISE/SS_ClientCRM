define('src/survey/vm.surveytype', [
  'src/core/notify',
  'src/util/utils',
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
    _this.ensureProps(['layersVM', 'tokensVM', 'possibleAnswersVM']);

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
    loadSurveys(_this, routeData, join);
    loadQuestionMeaning(_this, routeData, join);
  };

  function loadSurveys(_this, routeData, join) {
    var cb = join.add();
    dataservice.survey.getSurveys({
      SurveyTypeID: _this.model.SurveyTypeID
    }, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      var list = resp.Value.map(function(model) {
        var vm = createSurvey(_this, model);
        // lazy loaded surveys
        // vm.load(routeData, join.add());
        return vm;
      });
      _this.surveys(list);
      cb();
    });
  }

  function loadQuestionMeaning(_this, routeData, join) {
    var cb = join.add();
    dataservice.survey.getQuestionMeanings({
      SurveyTypeID: _this.model.SurveyTypeID
    }, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      var list = resp.Value.map(function(model) {
        var vm = new QuestionMeaningViewModel({
          tokensVM: _this.tokensVM,
          model: model,
        });
        _this.qmMap[model.QuestionMeaningID] = vm;
        vm.load(routeData, join.add());
        return vm;
      });
      _this.questionMeanings(list);
      cb();
    });
  }

  SurveyTypeViewModel.prototype.addQuestionMeaning = function(model) {
    var _this = this,
      id = model.QuestionMeaningID,
      vm;
    if (_this.qmMap[id]) {
      return;
    }
    vm = new QuestionMeaningViewModel({
      model: model,
    });
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
      possibleAnswersVM: surveyTypeVM.possibleAnswersVM,
      surveyTypeVM: surveyTypeVM,
      model: model,
    });
  }

  return SurveyTypeViewModel;
});
