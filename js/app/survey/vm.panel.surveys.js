define('src/survey/vm.panel.surveys', [
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
  'src/survey/vm.surveytype',
  'src/dataservice'
], function(
  notify,
  utils,
  ControllerViewModel,
  SurveyTypeViewModel,
  dataservice
) {
  'use strict';

  function SurveysPanelViewModel(options) {
    var _this = this;
    SurveysPanelViewModel.super_.call(_this, options);
  }
  utils.inherits(SurveysPanelViewModel, ControllerViewModel);

  SurveysPanelViewModel.prototype.onLoad = function(routeData, cb) { // override me
    var _this = this;
    dataservice.survey.getSurveyTypes({}, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(new SurveyTypeViewModel({
            model: item,
          }));
        });
        _this.list(list);
      }
      cb(true);
    });
  };

  SurveysPanelViewModel.prototype.onActivate = function(routeData) { // overrides base
    routeData = routeData;
  };

  return SurveysPanelViewModel;
});
