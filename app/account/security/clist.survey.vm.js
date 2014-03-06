define('src/account/security/clist.survey.vm', [
  'src/survey/takesurvey.vm',
  'src/account/security/clist.survey.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  TakeSurveyViewModel,
  CListSurveyGridViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSurveyViewModel(options) {
    var _this = this;
    CListSurveyViewModel.super_.call(_this, options);

    _this.gvm = new CListSurveyGridViewModel({
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
            resultid: item.resultid,
          }, null, function() {
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
  utils.inherits(CListSurveyViewModel, ControllerViewModel);
  CListSurveyViewModel.prototype.viewTmpl = 'tmpl-security-clist_survey';

  CListSurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };

  return CListSurveyViewModel;
});
