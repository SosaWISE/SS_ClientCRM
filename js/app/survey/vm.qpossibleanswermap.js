define('src/survey/vm.qpossibleanswermap', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
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
    _this.active(!_this.model.IsDeleted);

    //
    // events
    //
    _this.cmdToggle = ko.command(
      function(cb) {
        var model = _this.model;
        model.IsDeleted = !model.IsDeleted;
        dataservice.survey.questionPossibleAnswerMap.save(model, null, function(err, resp) {
          if (err) {
            notify.notify('warn', err.Message);
          } else {
            _this.model = resp.Value;
            _this.active(!_this.model.IsDeleted);
          }
          cb();
        });
      }
    );
  }
  utils.inherits(QPossibleAnswerMapViewModel, BaseViewModel);

  return QPossibleAnswerMapViewModel;
});
