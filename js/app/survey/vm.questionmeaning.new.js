define('src/survey/vm.questionmeaning.new', [
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  ukov,
  dataservice,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  ukov.schema['questionmeaning-validate'] = {
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
    if (!_this.surveyTypeVM) {
      throw new Error('missing surveyTypeVM');
    }

    _this.qmData = ukov.wrapModel({
      // QuestionMeaningID: 0,
      SurveyTypeId: _this.surveyTypeVM.model.SurveyTypeID,
      Name: _this.name,
    }, 'questionmeaning-validate', 'questionmeaning-validate-vm');

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.cmdAdd.busy()) {
        return;
      }
      _this.layer.close();
    };
    _this.cmdAdd = ko.command(function(cb) {
      _this.qmData.Name.validate();
      _this.qmData.update();
      if (!_this.qmData.isValid()) {
        notify.notify('warn', _this.qmData.errMsg(), 10);
        return cb();
      }
      dataservice.survey.saveQuestionMeaning(_this.qmData.model, function(resp) {
        if (resp.Code !== 0) {
          notify.notify('error', resp.Message);
        } else {
          _this.layer.close(resp.Value);
        }
        cb();
      });
    });
  }
  utils.inherits(NewQuestionMeaningViewModel, BaseViewModel);
  NewQuestionMeaningViewModel.prototype.viewTmpl = 'tmpl-questionmeaning_new';

  return NewQuestionMeaningViewModel;
});
