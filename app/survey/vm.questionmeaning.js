define('src/survey/vm.questionmeaning', [
  'src/survey/vm.qmtokenmap',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
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
    ControllerViewModel.ensureProps(this, ['tokensVM']);

    _this.tokenMaps = _this.childs;
  }
  utils.inherits(QuestionMeaningViewModel, ControllerViewModel);
  QuestionMeaningViewModel.prototype.viewTmpl = 'tmpl-questionmeaning';

  QuestionMeaningViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.questionMeanings.read({
      id: _this.model.QuestionMeaningID,
      link: 'questionMeaningTokenMaps',
    }, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      if (resp.Value) {
        var list = resp.Value.map(function(item) {
          return createTokenMap(_this.tokensVM, item);
        });
        _this.tokenMaps(list);
      } else {
        _this.tokenMaps([]);
      }
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
