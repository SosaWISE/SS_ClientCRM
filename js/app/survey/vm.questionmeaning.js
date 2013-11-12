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

    _this.tokenMaps = _this.childs;
  }
  utils.inherits(QuestionMeaningViewModel, ControllerViewModel);
  QuestionMeaningViewModel.prototype.viewTmpl = 'tmpl-questionmeaning';

  QuestionMeaningViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.getQuestionMeaningTokenMaps({
      QuestionMeaningID: _this.model.QuestionMeaningID,
    }, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      var list = resp.Value.map(function(item) {
        return createTokenMap(_this.tokensVM, item);
      });
      _this.tokenMaps(list);
      cb();
    });
  };

  QuestionMeaningViewModel.prototype.addTokenMap = function(model) {
    var _this = this;
    _this.tokenMaps.push(createTokenMap(_this.tokensVM, model));
  };

  function createTokenMap(tokensVM, model) {
    return new QMTokenMapViewModel({
      tokensVM: tokensVM,
      model: model,
    });
  }

  return QuestionMeaningViewModel;
});
