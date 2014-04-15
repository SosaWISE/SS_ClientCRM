define('src/account/security/clist.survey.vm', [
  'ko',
  'src/dataservice',
  'src/survey/takesurvey.vm',
  'src/account/security/clist.survey.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
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
    ControllerViewModel.ensureProps(_this, ['surveyTypeId']);

    _this.loadedResultVmMap = {};
    _this.gvm = new CListSurveyGridViewModel({
      onClick: function(item) {
        _this.checkForCurrentSurvey(function() {
          loadResult(item);
        });
        // if (_this.currentSurveyVm) {
        //   notify.confirm('Are you sure?', 'Do you want to scrap the current survey?', function(result) {
        //     if (result === 'yes') {
        //       _this.currentSurveyVm = null;
        //       loadResult(item);
        //     } else {
        //       _this.gvm.setSelectedRows([]);
        //       _this.gvm.resetActiveCell();
        //     }
        //   });
        // } else {
        //   loadResult(item);
        // }
      },
    });

    function loadResult(item) {
      var vm = _this.loadedResultVmMap[item.ResultID];
      if (!vm) {
        _this.loadedResultVmMap[item.ResultID] = vm = new TakeSurveyViewModel({
          accountid: _this.accountid,
          surveyResult: item,
          onSaved: function() {},
        });
        vm.load({}, {}, function() {});
      }
      _this.activeChild(vm);
    }

    //
    // events
    //
    _this.cmdRetakeLastSurvey = ko.command(function(cb) {
      var surveyResultView = _this.gvm.list()[0];
      if (!surveyResultView) {
        notify.notify('warn', 'Please select a survey result', 7);
        cb();
        return;
      }
      _this.retakeSurvey(surveyResultView, cb);
    }, function(busy) {
      return !busy && _this.gvm.list().length;
    });
    _this.cmdTakeSurvey = ko.command(function(cb) {
      _this.takeSurvey(cb);
    });
  }
  utils.inherits(CListSurveyViewModel, ControllerViewModel);
  CListSurveyViewModel.prototype.viewTmpl = 'tmpl-security-clist_survey';

  CListSurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountid = routeData.id;

    load_accountSurveys(_this.accountid, _this.gvm, join.add());
    load_activeSurvey(_this.surveyTypeId, function(survey) {
      _this.surveyid = survey.SurveyID;
    }, join);
  };
  CListSurveyViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    var _this = this;
    if ( !! _this.gvm.list().length && !_this.activeChild.peek()) {
      // take the survey since it hasn't been taken yet
      _this.takeSurvey();
    }
    // CListSurveyViewModel.super_.prototype.onActivate.call(_this, routeCtx);
  };

  CListSurveyViewModel.prototype.takeSurvey = function(cb) {
    var _this = this;
    //@REVIEW: how to get correct LocalizatonID
    showTakeSurvey(_this, _this.surveyid, 'en', null, false, cb);
  };
  CListSurveyViewModel.prototype.retakeSurvey = function(surveyResultView, cb) {
    var _this = this;
    showTakeSurvey(_this, null, null, surveyResultView, true, cb);
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

  CListSurveyViewModel.prototype.reloadAccountSurveys = function() {
    var _this = this;
    load_accountSurveys(_this.accountid, _this.gvm, function(err) {
      if (err) {
        notify.notify('error', err.Message);
      }
    });
  };

  CListSurveyViewModel.prototype.checkForCurrentSurvey = function(yesCb, noCb) {
    var _this = this;
    if (_this.currentSurveyVm) {
      notify.confirm('Are you sure?', 'Do you want to scrap the current survey?', function(result) {
        if (result === 'yes') {
          // scrap current survey
          _this.currentSurveyVm = null;
          _this.activeChild(null);
          yesCb();
        } else {
          // make sure nothing in the grid is selected
          _this.gvm.setSelectedRows([]);
          _this.gvm.resetActiveCell();
          if (utils.isFunc(noCb)) {
            noCb();
          }
        }
      });
    } else {
      yesCb();
    }
  };


  function showTakeSurvey(_this, surveyid, locale, surveyResultView, retake, cb) {
    _this.checkForCurrentSurvey(function() {
      var vm, dataContext = _this.getDataContext();
      vm = new TakeSurveyViewModel({
        accountid: _this.accountid,
        dataContext: dataContext,
        onSaved: function() {
          _this.currentSurveyVm = null;
          _this.reloadAccountSurveys();
        },

        // options for first time
        surveyid: surveyid,
        locale: locale,

        // options for retaking
        surveyResult: surveyResultView,
        retake: retake,
      });
      _this.activeChild(vm);
      vm.load({}, {}, cb);

      _this.gvm.setSelectedRows([]);
      _this.gvm.resetActiveCell();

      _this.currentSurveyVm = vm;
    }, cb);
  }


  function load_activeSurvey(surveyTypeId, setter, join) {
    var cb = join.add();
    dataservice.survey.surveyTypes.read({
      id: surveyTypeId,
      link: 'activeSurvey',
    }, setter, cb);
  }

  function load_accountSurveys(accountid, gvm, cb) {
    // reset data
    gvm.list([]);
    gvm.setSelectedRows([]);
    gvm.resetActiveCell();
    // load data
    dataservice.msaccountsetupsrv.accounts.read({
      id: accountid,
      link: 'surveys',
    }, gvm.list, cb);
  }


  return CListSurveyViewModel;
});
