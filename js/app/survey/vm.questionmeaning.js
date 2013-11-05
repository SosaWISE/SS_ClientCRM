define('src/survey/vm.questionmeaning', [
  'src/survey/vm.qmtokenmap',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
], function(
  QMTokenMapViewModel,
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function QuestionMeaningViewModel(options) {
    var _this = this;
    QuestionMeaningViewModel.super_.call(_this, options);

    _this.tokens = _this.list;
  }
  utils.inherits(QuestionMeaningViewModel, ControllerViewModel);
  QuestionMeaningViewModel.prototype.viewTmpl = 'tmpl-questionmeaning';

  QuestionMeaningViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this;

    dataservice.survey.getQuestionMeaningTokenMaps({
      QuestionMeaningID: _this.model.QuestionMeaningID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(createTokenMap(_this.tokensVM, item));
        });
        _this.tokens(list);
      }
      cb(false);
    });
  };

  QuestionMeaningViewModel.prototype.addTokenMap = function(model) {
    var _this = this;
    _this.list.push(createTokenMap(_this.tokensVM, model));
  };

  function createTokenMap(tokensVM, model) {
    return new QMTokenMapViewModel({
      tokensVM: tokensVM,
      model: model,
    });
  }

  return QuestionMeaningViewModel;
});
