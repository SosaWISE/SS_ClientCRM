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

    _this.possibleAnswers = _this.childs;
    _this.paMap = {};
  }
  utils.inherits(PossibleAnswersViewModel, ControllerViewModel);

  PossibleAnswersViewModel.prototype.onLoad = function(join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.getPossibleAnswers({}, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      resp.Value.forEach(function(item) {
        _this.paMap[item.PossibleAnswerID] = item;
      });
      _this.possibleAnswers(resp.Value);
      cb();
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
