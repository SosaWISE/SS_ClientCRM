define('src/survey/vm.surveytranslation.new', [
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/util/strings',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
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

  var localeRegx = /^[A-Z]{2}(?:-[A-Z]{2})?$/i;

  ukov.schema['surveytranslation-validate'] = {
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
    _this.ensureProps(['surveyVM']);

    _this.focus = ko.observable(false);
    _this.stData = ukov.wrapModel({
      // SurveyTranslationID: 0,
      SurveyId: _this.surveyVM.model.SurveyID,
      LocalizationCode: '',
    }, 'surveytranslation-validate', 'surveytranslation-validate-vm');

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
      var localizationCode = _this.stData.LocalizationCode;
      localizationCode.validate();
      if (localizationCode.isValid() && _this.surveyVM.hasLocalizationCode(localizationCode())) {
        localizationCode.errMsg(strings.format('A translation with localization code `{0}` already exists', localizationCode()));
      }
      _this.stData.update();
      if (!_this.stData.isValid()) {
        notify.notify('warn', _this.stData.errMsg(), 7);
        return cb();
      }
      dataservice.survey.saveSurveyTranslation(_this.stData.model, function(resp) {
        if (resp.Code !== 0) {
          notify.notify('error', resp.Message);
        } else {
          _this.layer.close(resp.Value);
        }
        cb();
      });
    });
  }
  utils.inherits(NewSurveyTranslationViewModel, BaseViewModel);
  NewSurveyTranslationViewModel.prototype.viewTmpl = 'tmpl-surveytranslation_new';

  NewSurveyTranslationViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focus(true);
    }, 100);
  };
  return NewSurveyTranslationViewModel;
});
