define('src/account/security/clist.survey.vm', [
  'src/dataservice',
  'src/survey/takesurvey.vm',
  'src/account/security/clist.survey.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
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
        if (!item.vm) {
          item.vm = new TakeSurveyViewModel({
            surveyResult: item,
          });
          item.vm.load({}, {}, function() {});
        }
        _this.activeChild(item.vm);
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
    _this.clickTakeSurvey = function() {
      var vm = new TakeSurveyViewModel({
        dataContext: _this.getDataContext(),
        surveyid: 1,
        locale: 'en',
      });
      vm.load({}, {}, function() {});
      _this.activeChild(vm);
    };
  }
  utils.inherits(CListSurveyViewModel, ControllerViewModel);
  CListSurveyViewModel.prototype.viewTmpl = 'tmpl-security-clist_survey';

  CListSurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    _this.accountid = routeData.id;

    dataservice.msaccountsetupsrv.accounts.read({
      id: _this.accountid,
      link: 'surveys',
    }, null, utils.safeCallback(cb, function(err, resp) {
      _this.gvm.list(resp.Value);
    }, function(err) {
      notify.notify('error', err.Message);
    }));
  };

  CListSurveyViewModel.prototype.getDataContext = function() {
    //@TODO: get real data context
    return {
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
    };
  };

  return CListSurveyViewModel;
});
