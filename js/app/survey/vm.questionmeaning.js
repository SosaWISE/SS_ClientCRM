define('src/survey/vm.questionmeaning', [
  'src/core/notify',
  'src/util/utils',
  'ko',
  'src/core/vm.controller',
  'src/dataservice',
], function(
  notify,
  utils,
  ko,
  ControllerViewModel,
  dataservice
) {
  'use strict';

  function QuestionMeaningViewModel(options) {
    var _this = this;
    QuestionMeaningViewModel.super_.call(_this, options);
  }
  utils.inherits(QuestionMeaningViewModel, ControllerViewModel);
  QuestionMeaningViewModel.prototype.viewTmpl = 'tmpl-questionmeaning';

  QuestionMeaningViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this;

    dataservice.survey.getQuestionMeaningTokens({
      QuestionMeaningID: _this.model.QuestionMeaningID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        _this.list(resp.Value);
      }
      cb(false);
    });
  };

  return QuestionMeaningViewModel;
});
