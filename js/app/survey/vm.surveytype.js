define('src/survey/vm.surveytype', [
  'src/core/notify',
  'src/util/utils',
  'src/util/joiner',
  'ko',
  'src/core/vm.controller',
  'src/survey/vm.survey',
  'src/survey/vm.questionmeaning',
  'src/dataservice',
], function(
  notify,
  utils,
  joiner,
  ko,
  ControllerViewModel,
  SurveyViewModel,
  QuestionMeaningViewModel,
  dataservice
) {
  'use strict';

  function SurveyTypeViewModel(options) {
    var _this = this;
    SurveyTypeViewModel.super_.call(_this, options);

    _this.surveys = ko.observableArray();
    _this.questionMeanings = ko.observableArray();
    _this.qmMap = {};
  }
  utils.inherits(SurveyTypeViewModel, ControllerViewModel);
  SurveyTypeViewModel.prototype.viewTmpl = 'tmpl-surveytype';

  SurveyTypeViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this,
      childList = [],
      join = joiner(),
      jList = [];

    jList.push(join.add());
    dataservice.survey.getSurveys({
      SurveyTypeID: _this.model.SurveyTypeID
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(new SurveyViewModel({
            possibleAnswersVM: _this.possibleAnswersVM,
            surveyTypeVM: _this,
            model: item,
          }));
        });
        _this.surveys(list);
        // _this.list(list);
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    jList.push(join.add());
    dataservice.survey.getQuestionMeanings({
      SurveyTypeID: _this.model.SurveyTypeID
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(new QuestionMeaningViewModel({
            tokensVM: _this.tokensVM,
            model: item,
          }));
        });
        list.forEach(function(vm) {
          _this.qmMap[vm.model.QuestionMeaningID] = vm;
        });
        _this.questionMeanings(list);
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    join.when(function() {
      _this.list(childList);
      cb(true);
    });
  };

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

  return SurveyTypeViewModel;
});
