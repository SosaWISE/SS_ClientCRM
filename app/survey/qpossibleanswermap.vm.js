define('src/survey/qpossibleanswermap.vm', [
  'src/survey/qpossibleanswermap.new.vm',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  NewQPossibleAnswerMapViewModel,
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
    BaseViewModel.ensureProps(_this, ['questionVM', 'topVm', 'possibleAnswersVM']);

    _this.possibleAnswer = _this.possibleAnswersVM.getPossibleAnswer(_this.model.PossibleAnswerId);
    _this.expands = _this.active;
    _this.expands(_this.model.Expands);
    _this.fails = ko.observable(_this.model.Fails);

    //
    // events
    //
    _this.cmdEdit = ko.command(function(cb) {
      _this.topVm.layersVm.show(new NewQPossibleAnswerMapViewModel({
        item: utils.clone(_this.model),
        questionVM: _this.questionVM,
        possibleAnswersVM: _this.possibleAnswersVM,
      }), function(model) {
        if (!model) {
          return;
        }
        _this.model = model;
        _this.expands(_this.model.Expands);
        _this.fails(_this.model.Fails);
      });
      cb();

      // var model = _this.model;
      // model.Expands = !model.Expands;
      // dataservice.survey.questionPossibleAnswerMaps.save({
      //   data: model,
      // }, null, utils.safeCallback(cb, function(err, resp) {
      //   _this.model = resp.Value;
      //   _this.expands(_this.model.Expands);
      // }, notify.error));
    }, function(busy) {
      return !busy && !_this.topVm.isReadonly();
    });
  }
  utils.inherits(QPossibleAnswerMapViewModel, BaseViewModel);

  return QPossibleAnswerMapViewModel;
});
