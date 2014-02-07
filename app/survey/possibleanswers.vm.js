define('src/survey/possibleanswers.vm', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
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

  PossibleAnswersViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.possibleAnswers.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        if (resp.Value) {
          resp.Value.forEach(function(item) {
            _this.paMap[item.PossibleAnswerID] = item;
          });
          _this.possibleAnswers(resp.Value);
        } else {
          _this.possibleAnswers([]);
        }
      }, cb);
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
