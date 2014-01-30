define('src/panels/surveys.panel.vm', [
  'ko',
  'src/dataservice',
  'src/core/layers.vm',
  'src/core/helpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  dataservice,
  LayersViewModel,
  helpers,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  // lazy load account dependencies
  var deps = {},
    ensureDeps = helpers.onetimer(function loadDeps(cb) {
      require([
        'src/survey/tokens.vm',
        'src/survey/possibleanswers.vm',
        'src/survey/surveytype.vm',
      ], function() {
        var args = arguments;
        deps.TokensViewModel = args[0];
        deps.PossibleAnswersViewModel = args[1];
        deps.SurveyTypeViewModel = args[2];
        cb();
      });
    });

  function SurveysPanelViewModel(options) {
    var _this = this;
    SurveysPanelViewModel.super_.call(_this, options);

    _this.surveyTypes = _this.childs;
    _this.layersVM = new LayersViewModel();

    //
    // events
    //
    _this.clickSurvey = function(surveyVM) {
      _this.selectChild(surveyVM);
    };
  }
  utils.inherits(SurveysPanelViewModel, ControllerViewModel);

  SurveysPanelViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      tokensVM, possibleAnswersVM,
      cb = join.add(),
      depJoin = join.create();

    ensureDeps(function() {
      tokensVM = new deps.TokensViewModel();
      possibleAnswersVM = new deps.PossibleAnswersViewModel();

      tokensVM.load(routeData, depJoin.add());
      possibleAnswersVM.load(routeData, depJoin.add());

      dataservice.survey.surveyTypes.read({}, null, function(err, resp) {
        if (err) {
          return cb(err);
        }
        // wait until the dependencies have been loaded
        depJoin.when(function(err) {
          utils.safeCallback(err, function() {
            if (resp.Value) {
              var list = resp.Value.map(function(model) {
                var vm = new deps.SurveyTypeViewModel({
                  pcontroller: _this,
                  layersVM: _this.layersVM,
                  tokensVM: tokensVM,
                  possibleAnswersVM: possibleAnswersVM,
                  model: model,
                });
                vm.load(routeData, join.add());
                return vm;
              });
              _this.surveyTypes(list);
            } else {
              //
              _this.surveyTypes([]);
            }
          }, cb);
        });
      });
    });
  };

  return SurveysPanelViewModel;
});
