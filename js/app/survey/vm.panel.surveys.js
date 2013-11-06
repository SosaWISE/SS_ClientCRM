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

    //
    // events
    //
    _this.clickSurvey = function(surveyVM) {
      if (surveyVM.active()) {
        return;
      }
      _this.onDeactivate();
      _this.activeChild(surveyVM);
      surveyVM.activate();

      var routeData = _this.lastRouteData || {};
      routeData.surveyid = surveyVM.id;
      _this.setRouteData(routeData);
    };
  }
  utils.inherits(SurveysPanelViewModel, ControllerViewModel);
  SurveysPanelViewModel.prototype.childName = 'surveyid';
  SurveysPanelViewModel.prototype.defaultChild = '';
  SurveysPanelViewModel.prototype.extraRouteData = ['id', 'action'];

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

  SurveysPanelViewModel.prototype.findChild = function(id) {
    var _this = this,
      result;

    _this.surveyTypes().some(function(surveyTypeVM) {
      return surveyTypeVM.surveys().some(function(surveyVM) {
        /* jshint eqeqeq:false */
        if (surveyVM.model.SurveyID == id) {
          result = surveyVM;
          return true;
        }
      });
    });
    return result;
  };

  return SurveysPanelViewModel;
});
