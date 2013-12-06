define('src/survey/vm.survey.new', [
  'src/util/strings',
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  strings,
  ukov,
  dataservice,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  var regx = /^[0-9]+.[0-9]+.[0-9]+$/,
    schema = {
      _model: true,
      SurveyID: {},
      SurveyTypeId: {},
      Version: {
        converter: ukov.converters.string(),
        validators: [
          ukov.validators.isRequired('Version is required'),
          function(val) {
            if (!regx.test(val)) {
              return 'invalid version';
            }
          },
        ],
      },
    };

  function NewSurveyViewModel(options) {
    var _this = this;
    NewSurveyViewModel.super_.call(_this, options);
    _this.ensureProps(['surveyTypeVM']);

    _this.sData = ukov.wrap({
      // SurveyID: 0,
      SurveyTypeId: _this.surveyTypeVM.model.SurveyTypeID,
      Version: '',
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
      var version = _this.sData.Version;
      version.validate();
      if (version.isValid() && _this.surveyTypeVM.hasVersion(version())) {
        version.errMsg(strings.format('A survey with version `{0}` already exists for {1}', version(), _this.surveyTypeVM.model.Name));
      }
      _this.sData.update();
      if (!_this.sData.isValid()) {
        notify.notify('warn', _this.sData.errMsg(), 10);
        return cb();
      }
      dataservice.survey.surveys.save(_this.sData.model, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
        } else {
          _this.layer.close(resp.Value);
        }
        cb();
      });
    });
  }
  utils.inherits(NewSurveyViewModel, BaseViewModel);
  NewSurveyViewModel.prototype.viewTmpl = 'tmpl-survey_new';
  NewSurveyViewModel.prototype.width = 300;
  NewSurveyViewModel.prototype.height = 250;

  return NewSurveyViewModel;
});
