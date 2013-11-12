define('src/survey/vm.panel.surveys', [
  'src/util/joiner',
  'src/core/vm.layers',
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
  LayersViewModel,
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

    _this.surveyTypes = _this.childs;

    _this.layersVM = new LayersViewModel();


    //
    // events
    //
    _this.clickSurvey = function(surveyVM) {
      if (surveyVM.active()) {
        return;
      }
      _this.goTo({
        surveyid: surveyVM.id,
      });
    };
  }
  utils.inherits(SurveysPanelViewModel, ControllerViewModel);

  SurveysPanelViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      tokensVM = new TokensViewModel(),
      possibleAnswersVM = new PossibleAnswersViewModel(),
      cb = join.add(),
      depJoin = join.create();

    tokensVM.load(routeData, depJoin.add());
    possibleAnswersVM.load(routeData, depJoin.add());

    dataservice.survey.getSurveyTypes({}, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      // ensure the dependencies have loaded
      depJoin.when(function(err) {
        if (err) {
          return cb(err);
        }
        var list = resp.Value.map(function(model) {
          var vm = new SurveyTypeViewModel({
            layersVM: _this.layersVM,
            tokensVM: tokensVM,
            possibleAnswersVM: possibleAnswersVM,
            model: model,
          });
          vm.load(routeData, join.add());
          return vm;
        });
        _this.surveyTypes(list);
        //
        cb();
      });
    });
  };

  SurveysPanelViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result;
    _this.surveyTypes().some(function(surveyTypeVM) {
      // use whichever survey type finds a child
      if (surveyTypeVM.findChild(routeData)) {
        result = surveyTypeVM;
        return true;
      }
    });
    return result;
  };

  return SurveysPanelViewModel;
});
