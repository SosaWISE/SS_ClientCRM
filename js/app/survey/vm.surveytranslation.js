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

    _this.questionTranslationsMap = ko.observable({});
  }
  utils.inherits(SurveyTranslationViewModel, ControllerViewModel);
  SurveyTranslationViewModel.prototype.viewTmpl = 'tmpl-surveytranslation';

  SurveyTranslationViewModel.prototype.onLoad = function(routeData, cb) { // override me
    var _this = this;

    dataservice.survey.getQuestionTranslations({
      SurveyTranslationID: _this.model.SurveyTranslationID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var map = {};
        resp.Value.forEach(function(item) {
          map[item.QuestionId] = new QuestionTranslationViewModel({
            surveyTranslationVM: _this,
            model: item,
          });
        });
        _this.questionTranslationsMap(map);
      }
      cb(true);
    });
  };

  return SurveyTranslationViewModel;
});
