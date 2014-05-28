define('src/survey/takesurveytranslation.vm', [
  'src/core/notify',
  'src/core/combo.vm',
  'src/survey/takesurvey.vm',
  'src/survey/contexteditor.vm',
  'src/core/utils',
  'src/core/base.vm',
], function(
  notify,
  ComboViewModel,
  TakeSurveyViewModel,
  ContextEditorViewModel,
  utils,
  BaseViewModel
) {
  'use strict';

  function TakeSurveyTranslationViewModel(options) {
    var _this = this;
    TakeSurveyTranslationViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['surveyTranslationVMs', 'surveyid']);

    _this.localeCvm = new ComboViewModel({
      list: _this.surveyTranslationVMs.map(function(surveyTranslationVM) {
        var locale = surveyTranslationVM.model.LocalizationCode;
        return {
          value: locale,
          text: locale,
        };
      })
    });
    _this.updateSurveyTranslations(_this.surveyTranslationVMs);

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.layer) {
        _this.layer.close();
      }
    };
    _this.clickTake = _this.take.bind(_this);
  }
  utils.inherits(TakeSurveyTranslationViewModel, BaseViewModel);
  TakeSurveyTranslationViewModel.prototype.viewTmpl = 'tmpl-takesurveytranslation';
  TakeSurveyTranslationViewModel.prototype.width = 300;
  TakeSurveyTranslationViewModel.prototype.height = 250;

  TakeSurveyTranslationViewModel.prototype.updateSurveyTranslations = function(surveyTranslationVMs) {
    var _this = this;
    surveyTranslationVMs = surveyTranslationVMs || [];
    _this.localeCvm.setList(surveyTranslationVMs.map(function(surveyTranslationVM) {
      var locale = surveyTranslationVM.model.LocalizationCode;
      return {
        value: locale,
        text: locale,
      };
    }));

    if (!_this.localeCvm.selectedValue() && _this.localeCvm.list()[0]) {
      _this.localeCvm.selectedValue(_this.localeCvm.list()[0].value);
    }
  };


  TakeSurveyTranslationViewModel.prototype.take = function() {
    var _this = this,
      vm, locale;
    if (!_this.layersVm) {
      return;
    }

    locale = _this.localeCvm.selectedValue();
    if (!locale) {
      notify.notify('warn', 'No localization code selected', 7);
      return;
    }
    vm = new TakeSurveyViewModel({
      accountid: 0,
      surveyid: _this.surveyid,
      locale: locale,
      onSaved: function() {
        alert('yay! saved!');
      },
    });

    if (!_this.contextEditorVm) {
      _this.contextEditorVm = new ContextEditorViewModel({
        dataContext: {
          CompanyName: 'Nexsense',
          ADUserDisplayName: 'ADUserDisplayName',
          PrimaryCustomer: {
            Name: 'Bob',
            LastName: 'Bobbins',
            FullName: 'Bob Bobbins',
            Phone1: '8015551234',
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
          ContractTerms: {
            ContractLength: 60,
            BillingMethod: 2,
            MonthlyMonitoringFee: 49.99,
            TotalActivationFee: 199.99,
            ActivationFeePaymentMethod: 1,
            BillingDate: '15th',
            HasSalesUpgrades: true,
          },
          SalesRep: {
            FirstName: 'RepName',
          },
        },
      });
    }
    _this.contextEditorVm.setTakeSurveyVm(vm);

    _this.layersVm.show(vm);
  };

  return TakeSurveyTranslationViewModel;
});
