define('src/survey/vm.surveytranslation', [
  'src/core/notify',
  'src/util/utils',
  'ko',
  'src/core/vm.controller',
  'src/survey/vm.questiontranslation',
  'src/dataservice',
], function(
  notify,
  utils,
  ko,
  ControllerViewModel,
  QuestionTranslationViewModel,
  dataservice
) {
  'use strict';

  function SurveyTranslationViewModel(options) {
    var _this = this;
    SurveyTranslationViewModel.super_.call(_this, options);

    _this.list = _this.childs;

    //
    // events
    //
    _this.click = function() {
      _this.active(!_this.active());
    };
  }
  utils.inherits(SurveyTranslationViewModel, ControllerViewModel);
  SurveyTranslationViewModel.prototype.viewTmpl = 'tmpl-surveytranslation';

  SurveyTranslationViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.getQuestionTranslations({
      SurveyTranslationID: _this.model.SurveyTranslationID,
    }, function(resp) {
      if (resp.Code !== 0) {
        return cb(resp);
      }
      // clear cache
      _this.map = null;
      //
      _this.list(resp.Value);
      cb();
    });
  };

  return SurveyTranslationViewModel;
});
