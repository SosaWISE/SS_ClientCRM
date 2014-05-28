define('src/survey/qpossibleanswermap.vm', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  dataservice,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  function QPossibleAnswerMapViewModel(options) {
    var _this = this;
    QPossibleAnswerMapViewModel.super_.call(_this, options);

    _this.possibleAnswer = _this.possibleAnswersVM.getPossibleAnswer(_this.model.PossibleAnswerId);
    _this.active(_this.model.Expands);

    //
    // events
    //
    _this.cmdToggle = ko.command(function(cb) {
      var model = _this.model;
      model.Expands = !model.Expands;
      dataservice.survey.questionPossibleAnswerMaps.save({
        data: model,
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', 'Error', err.Message);
        } else {
          _this.model = resp.Value;
          _this.active(_this.model.Expands);
        }
        cb();
      });
    });
  }
  utils.inherits(QPossibleAnswerMapViewModel, BaseViewModel);

  return QPossibleAnswerMapViewModel;
});
