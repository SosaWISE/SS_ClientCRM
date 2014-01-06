define('src/panels/vm.panel.surveys', [
  'ko',
  'src/dataservice',
  'src/core/vm.layers',
  'src/core/helpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
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
        'src/survey/vm.tokens',
        'src/survey/vm.possibleanswers',
        'src/survey/vm.surveytype',
      ], function() {
        var args = arguments;
        deps.TokensViewModel = args[0];
        deps.PossibleAnswersViewModel = args[1];
        deps.SurveyTypeViewModel = args[2];
        cb();
      });
    }),
    childRoutePart = 'surveyid';

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
                  routePart: childRoutePart,
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
