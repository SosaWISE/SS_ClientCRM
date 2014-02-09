define('src/survey/surveytranslation.vm', [
  'src/core/notify',
  'src/core/utils',
  'ko',
  'src/core/controller.vm',
  'src/survey/questiontranslation.vm',
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

    _this.id = _this.model.SurveyTranslationID;

    _this.list = _this.childs;

    //
    // events
    //
    _this.cmdToggle = ko.command(function(cb) {
      if (!_this.active()) {
        _this.load({}, null, function() {
          _this.active(true);
          cb();
        });
      } else {
        _this.active(false);
        cb();
      }
    });
  }
  utils.inherits(SurveyTranslationViewModel, ControllerViewModel);
  SurveyTranslationViewModel.prototype.viewTmpl = 'tmpl-surveytranslation';

  SurveyTranslationViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.surveyTranslations.read({
      id: _this.id,
      link: 'questionTranslations',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // clear cache
        _this.vmMap = {};
        //
        var map = {};
        _this.map = map;
        if (resp.Value) {
          resp.Value.forEach(function(model) {
            map[model.QuestionId] = model;
          });
          //
          _this.list(resp.Value);
        } else {
          _this.list([]);
        }
      }, cb);
    });
  };

  SurveyTranslationViewModel.prototype.getQuestionTranslationVM = function(questionVM) { // overrides base
    var _this = this,
      vmMap = _this.vmMap,
      questionId = questionVM.id,
      model, result;

    if (!vmMap) {
      return;
    }

    // get question translation
    result = vmMap[questionId];
    // create empty question translation
    if (!result) {
      model = _this.map[questionId];
      if (!model) {
        model = {
          // QuestionTranslationID: 0,
          SurveyTranslationId: _this.model.SurveyTranslationID,
          QuestionId: questionId,
          TextFormat: '',
        };
      }
      vmMap[questionId] = result = createQuestionTranslation(questionVM, _this, model);
    }

    return result;
  };

  function createQuestionTranslation(questionVM, surveyTranslationVM, model) {
    return new QuestionTranslationViewModel({
      questionVM: questionVM,
      surveyTranslationVM: surveyTranslationVM,
      model: model,
    });
  }

  return SurveyTranslationViewModel;
});
