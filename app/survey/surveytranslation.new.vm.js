define('src/survey/surveytranslation.new.vm', [
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ukov,
  dataservice,
  ko,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  var localeRegx = /^[A-Z]{2}(?:-[A-Z]{2})?$/i,
    schema = {
      _model: true,
      SurveyTranslationID: {},
      SurveyId: {},
      LocalizationCode: {
        converter: ukov.converters.string(),
        validators: [
          ukov.validators.isRequired('Localization Code is required'),
          function(val) {
            if (!localeRegx.test(val)) {
              return 'invalid localization code';
            }
          },
        ],
      },
    };

  function NewSurveyTranslationViewModel(options) {
    var _this = this;
    NewSurveyTranslationViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['surveyVM']);

    _this.initActiveFocus("focus");
    _this.stData = ukov.wrap({
      // SurveyTranslationID: 0,
      SurveyId: _this.surveyVM.model.SurveyID,
      LocalizationCode: '',
    }, schema);

    //
    // events
    //
    _this.clickCancel = function() {
      closeLayer(_this);
    };
    _this.cmdAdd = ko.command(function(cb) {
      var localizationCode = _this.stData.LocalizationCode;
      localizationCode.validate();
      if (localizationCode.isValid() && _this.surveyVM.hasLocalizationCode(localizationCode())) {
        localizationCode.errMsg(strings.format('A translation with localization code `{0}` already exists', localizationCode()));
      }
      _this.stData.update();
      if (!_this.stData.isValid()) {
        notify.warn(_this.stData.errMsg(), null, 7);
        return cb();
      }
      dataservice.survey.surveyTranslations.save({
        data: _this.stData.model,
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
  utils.inherits(NewSurveyTranslationViewModel, BaseViewModel);
  NewSurveyTranslationViewModel.prototype.viewTmpl = 'tmpl-surveytranslation_new';
  NewSurveyTranslationViewModel.prototype.width = 300;
  NewSurveyTranslationViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  NewSurveyTranslationViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  NewSurveyTranslationViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdAdd.busy() && !_this.layerResult) {
      msg = 'Please wait for add to finish.';
    }
    return msg;
  };

  return NewSurveyTranslationViewModel;
});
