define('src/survey/takesurveytranslation.vm', [
  'src/core/notify',
  'src/core/combo.vm',
  'src/survey/takesurvey.vm',
  'src/core/utils',
  'src/core/base.vm',
], function(
  notify,
  ComboViewModel,
  TakeSurveyViewModel,
  utils,
  BaseViewModel
) {
  'use strict';

  function TakeSurveyTranslationViewModel(options) {
    var _this = this;
    TakeSurveyTranslationViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['surveyTranslationVMs', 'routeCtx']);

    _this.localeComboVM = new ComboViewModel({
      list: _this.surveyTranslationVMs.map(function(surveyTranslationVM) {
        var locale = surveyTranslationVM.model.LocalizationCode;
        return {
          value: locale,
          text: locale,
        };
      })
    });

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.layer) {
        _this.layer.close();
      }
    };
    _this.clickTake = function() {
      if (!_this.layersVM) {
        return;
      }
      var vm, locale = _this.localeComboVM.selectedValue();
      if (!locale) {
        notify.notify('warn', 'No localization code selected', 10);
        return;
      }
      _this.routeCtx.routeData.locale = locale;
      vm = new TakeSurveyViewModel({
        tokenData: {
          CompanyName: 'CompanyName',
          ADUserDisplayName: 'ADUserDisplayName',
          PrimaryCustomer: {
            Name: 'Bob',
            LastName: 'Bobbins',
          },
          PremiseAddress: {
            Street: '111 Technology Way',
            City: 'Orem',
            State: 'UT',
            Zip: '84059',
          },
          SystemDetails: {
            PremisePhone: 'PremisePhone',
          },
        },
      });
      vm.activate(_this.routeCtx);
      _this.layersVM.show(vm);
      // _this.clickCancel();
    };
  }
  utils.inherits(TakeSurveyTranslationViewModel, BaseViewModel);
  TakeSurveyTranslationViewModel.prototype.viewTmpl = 'tmpl-takesurveytranslation';
  TakeSurveyTranslationViewModel.prototype.width = 300;
  TakeSurveyTranslationViewModel.prototype.height = 250;

  return TakeSurveyTranslationViewModel;
});
