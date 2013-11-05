define('src/survey/vm.possibleanswers', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
], function(
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function PossibleAnswersViewModel(options) {
    var _this = this;
    PossibleAnswersViewModel.super_.call(_this, options);

    _this.paMap = {};
  }
  utils.inherits(PossibleAnswersViewModel, ControllerViewModel);

  PossibleAnswersViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this;

    dataservice.survey.getPossibleAnswers({}, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        resp.Value.forEach(function(item) {
          _this.paMap[item.PossibleAnswerID] = item;
        });
        _this.list(resp.Value);
      }
      cb(false);
    });
  };

  PossibleAnswersViewModel.prototype.getPossibleAnswer = function(possibleAnswerId) {
    var result = this.paMap[possibleAnswerId];
    if (!result) {
      console.error('no possibleanswer for', possibleAnswerId);
    }
    return result;
  };

  return PossibleAnswersViewModel;
});
