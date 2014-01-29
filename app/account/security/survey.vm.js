define('src/account/security/survey.vm', [
  'src/survey/takesurvey.vm',
  'src/account/security/survey.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  TakeSurveyViewModel,
  SurveyGridViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SurveyViewModel(options) {
    var _this = this;
    SurveyViewModel.super_.call(_this, options);

    _this.gvm = new SurveyGridViewModel({
      onClick: function(item) {
        var vm = item.vm;

        if (!vm) {
          item.vm = vm = new TakeSurveyViewModel({
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
          vm.load({
            surveyid: item.surveyid,
            locale: item.locale,
          }, function() {
            //
          });
        }

        _this.activeChild(vm);
      },
    });

    //
    // events
    //
    _this.clickSave = function() {
      alert('@TODO:');
    };
    _this.clickRetakeLastSurvey = function() {
      alert('@TODO:');
    };
  }
  utils.inherits(SurveyViewModel, ControllerViewModel);
  SurveyViewModel.prototype.viewTmpl = 'tmpl-security-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };

  return SurveyViewModel;
});
