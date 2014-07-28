define('src/survey/questionmeaning.new.vm', [
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ukov,
  dataservice,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  var schema = {
    _model: true,
    QuestionMeaningID: {},
    SurveyTypeId: {},
    Name: {
      converter: ukov.converters.string(),
      validators: [
        ukov.validators.isRequired('Meaning is required'),
      ],
    },
  };

  function NewQuestionMeaningViewModel(options) {
    var _this = this;
    NewQuestionMeaningViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['surveyTypeVM']);

    _this.qmData = ukov.wrap({
      // QuestionMeaningID: 0,
      SurveyTypeId: _this.surveyTypeVM.model.SurveyTypeID,
      Name: _this.name,
    }, schema);

    //
    // events
    //
    _this.clickCancel = function() {
      closeLayer(_this);
    };
    _this.cmdAdd = ko.command(function(cb) {
      _this.qmData.Name.validate();
      _this.qmData.update();
      if (!_this.qmData.isValid()) {
        notify.warn(_this.qmData.errMsg(), null, 10);
        return cb();
      }
      dataservice.survey.questionMeanings.save({
        data: _this.qmData.model,
      }, null, function(err, resp) {
        if (err) {
          notify.error(err);
        } else {
          _this.layerResult = resp.Value;
          closeLayer(_this);
        }
        cb();
      });
    });
  }
  utils.inherits(NewQuestionMeaningViewModel, BaseViewModel);
  NewQuestionMeaningViewModel.prototype.viewTmpl = 'tmpl-questionmeaning_new';
  NewQuestionMeaningViewModel.prototype.width = 300;
  NewQuestionMeaningViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  NewQuestionMeaningViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  NewQuestionMeaningViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdAdd.busy() && !_this.layerResult) {
      msg = 'Please wait for add to finish.';
    }
    return msg;
  };

  return NewQuestionMeaningViewModel;
});
