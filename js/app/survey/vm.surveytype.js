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
    // _this.questionMeanings = ko.observableArray();
    _this.questionMeaningsMap = {};
  }
  utils.inherits(SurveyTypeViewModel, ControllerViewModel);
  SurveyTypeViewModel.prototype.viewTmpl = 'tmpl-surveytype';

  SurveyTypeViewModel.prototype.onLoad = function(routeData, cb) { // override me
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
            model: item,
          }));
        });
        list.forEach(function(vm) {
          _this.questionMeaningsMap[vm.model.QuestionMeaningID] = vm;
        });
        // _this.questionMeanings(list);
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    join.when(function() {
      _this.list(childList);
      cb(true);
    });
  };

  return SurveyTypeViewModel;
});
