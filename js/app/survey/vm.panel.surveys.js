define('src/survey/vm.panel.surveys', [
  'src/util/joiner',
  'src/survey/vm.tokens',
  'src/survey/vm.possibleanswers',
  'src/survey/vm.surveytype',
  'ko',
  'src/dataservice',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
], function(
  joiner,
  TokensViewModel,
  PossibleAnswersViewModel,
  SurveyTypeViewModel,
  ko,
  dataservice,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function SurveysPanelViewModel(options) {
    var _this = this;
    SurveysPanelViewModel.super_.call(_this, options);

    _this.surveyTypes = ko.observableArray();
  }
  utils.inherits(SurveysPanelViewModel, ControllerViewModel);

  SurveysPanelViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this,
      childList = [],
      join = joiner(),
      jList = [],
      tokensVM = new TokensViewModel(),
      possibleAnswersVM = new PossibleAnswersViewModel();

    childList.push(tokensVM);
    childList.push(possibleAnswersVM);

    jList.push(join.add());
    dataservice.survey.getSurveyTypes({}, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(new SurveyTypeViewModel({
            tokensVM: tokensVM,
            possibleAnswersVM: possibleAnswersVM,
            model: item,
          }));
        });
        _this.surveyTypes(list);
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    join.when(function() {
      _this.list(childList);
      cb(true);
    });
  };

  SurveysPanelViewModel.prototype.onActivate = function(routeData) { // overrides base
    routeData = routeData;
  };

  return SurveysPanelViewModel;
});
