define('src/survey/vm.takesurveytranslation', [
  'src/vm.combo',
  'src/survey/vm.takesurvey',
  'src/util/utils',
  'src/core/vm.base',
], function(
  ComboViewModel,
  TakeSurveyViewModel,
  utils,
  BaseViewModel
) {
  'use strict';

  function TakeSurveyTranslationViewModel(options) {
    var _this = this;
    TakeSurveyTranslationViewModel.super_.call(_this, options);
    _this.ensureProps(['surveyTranslationVMs', 'routeCtx']);

    _this.localeComboVM = new ComboViewModel();
    _this.localeComboVM.setList(_this.surveyTranslationVMs.map(function(surveyTranslationVM) {
      var locale = surveyTranslationVM.model.LocalizationCode;
      return {
        locale: locale,
        text: locale,
      };
    }));

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
      _this.routeCtx.routeData.locale = _this.localeComboVM.selectedItem().item.locale;
      var vm = new TakeSurveyViewModel({
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
