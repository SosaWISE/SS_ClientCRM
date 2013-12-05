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
    _this.ensureProps(['surveyTypeVM']);

    _this.qmData = ukov.wrap({
      // QuestionMeaningID: 0,
      SurveyTypeId: _this.surveyTypeVM.model.SurveyTypeID,
      Name: _this.name,
    }, schema);

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
      dataservice.survey.questionMeanings.save(_this.qmData.model, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
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
