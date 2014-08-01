define('src/panels/surveys.panel.vm', [
  'src/survey/tokens.vm',
  'src/survey/possibleanswers.vm',
  'src/survey/surveytype.vm',
  'ko',
  'src/dataservice',
  'src/core/layers.vm',
  'src/core/helpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  TokensViewModel,
  PossibleAnswersViewModel,
  SurveyTypeViewModel,
  ko,
  dataservice,
  LayersViewModel,
  helpers,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function SurveysPanelViewModel(options) {
    var _this = this;
    SurveysPanelViewModel.super_.call(_this, options);

    _this.surveyTypes = _this.childs;
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
    _this.clickSurvey = function(surveyVM) {
      _this.selectChild(surveyVM);
    };
  }
  utils.inherits(SurveysPanelViewModel, ControllerViewModel);

  SurveysPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      tokensVM, possibleAnswersVM,
      cb = join.add(),
      depJoin = join.create();

    _this.surveyTypes([]);

    tokensVM = new TokensViewModel();
    possibleAnswersVM = new PossibleAnswersViewModel();

    tokensVM.loader.reset(); //incase of reload
    tokensVM.load(routeData, extraData, depJoin.add());
    possibleAnswersVM.loader.reset(); //incase of reload
    possibleAnswersVM.load(routeData, extraData, depJoin.add());

    dataservice.survey.surveyTypes.read({}, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      // wait until the dependencies have been loaded
      depJoin.when(utils.safeCallback(cb, function() {
        if (resp.Value) {
          var list = resp.Value.map(function(model) {
            var vm = new SurveyTypeViewModel({
              pcontroller: _this,
              layersVm: _this.layersVm,
              tokensVM: tokensVM,
              possibleAnswersVM: possibleAnswersVM,
              model: model,
            });
            vm.load(routeData, extraData, join.add());
            return vm;
          });
          _this.surveyTypes(list);
        } else {
          //
          _this.surveyTypes([]);
        }
      }, utils.no_op));
    });
  };

  return SurveysPanelViewModel;
});
