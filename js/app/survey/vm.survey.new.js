define('src/survey/vm.survey.new', [
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

  ukov.schema['survey-validate'] = {
    SurveyID: {},
    SurveyTypeId: {},
    Version: {
      converter: ukov.converters.string(),
      validators: [
        ukov.validators.isRequired('Version is required'),
        function(val) {
          return val;
        },
      ],
    },
  };

  function NewSurveyViewModel(options) {
    var _this = this;
    NewSurveyViewModel.super_.call(_this, options);
    _this.ensureProps(['surveyTypeVM']);

    _this.sData = ukov.wrapModel({
      // SurveyID: 0,
      SurveyTypeId: _this.surveyTypeVM.model.SurveyTypeID,
      Version: '',
    }, 'survey-validate', 'survey-validate-vm');

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
      _this.sData.Version.validate();
      _this.sData.update();
      if (!_this.sData.isValid()) {
        notify.notify('warn', _this.sData.errMsg(), 10);
        return cb();
      }
      dataservice.survey.saveSurvey(_this.sData.model, function(resp) {
        if (resp.Code !== 0) {
          notify.notify('error', resp.Message);
        } else {
          _this.layer.close(resp.Value);
        }
        cb();
      });
    });
  }
  utils.inherits(NewSurveyViewModel, BaseViewModel);
  NewSurveyViewModel.prototype.viewTmpl = 'tmpl-survey_new';

  return NewSurveyViewModel;
});
