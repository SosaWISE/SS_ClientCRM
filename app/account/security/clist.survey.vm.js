define('src/account/security/clist.survey.vm', [
  'src/config',
  'ko',
  'src/dataservice',
  'src/survey/takesurvey.vm',
  'src/account/security/clist.survey.gvm',
  'src/core/strings',
  'src/core/joiner',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  config,
  ko,
  dataservice,
  TakeSurveyViewModel,
  CListSurveyGridViewModel,
  strings,
  joiner,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSurveyViewModel(options) {
    var _this = this;
    CListSurveyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['surveyTypeId']);

    _this.loadingSurvey = ko.observable();

    _this.loadedResultVmMap = {};
    _this.gvm = new CListSurveyGridViewModel({
      onClick: function(item) {
        checkForCurrentSurvey(_this, function() {
          loadResult(item);
        });
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
        notify.notify('warn', 'Please select a survey result', null, 7);
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
    //@REVIEW: how to get correct LocalizatonID
    _this.locale = 'en';

    load_accountSurveys(_this.accountid, _this.gvm, join.add());
    load_activeSurvey(_this.surveyTypeId, function(survey) {
      _this.surveyid = survey.SurveyID;
    }, join);
  };
  CListSurveyViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    var _this = this;
    if (!_this.gvm.list().length) {
      if (_this.currentSurveyVm) {
        _this.activeChild(_this.currentSurveyVm);
      } else {
        // take the survey since it hasn't been taken yet
        _this.cmdTakeSurvey.execute();
      }
    }
    // CListSurveyViewModel.super_.prototype.onActivate.call(_this, routeCtx);
  };

  CListSurveyViewModel.prototype.takeSurvey = function(cb) {
    var _this = this;
    showTakeSurvey(_this, _this.surveyid, _this.locale, null, false, cb);
  };
  CListSurveyViewModel.prototype.retakeSurvey = function(surveyResultView, cb) {
    var _this = this;
    showTakeSurvey(_this, null, null, surveyResultView, true, cb);
  };

  CListSurveyViewModel.prototype.reloadAccountSurveys = function() {
    var _this = this;
    load_accountSurveys(_this.accountid, _this.gvm, function(err) {
      if (err) {
        notify.notify('error', 'Error', err.Message);
      }
    });
  };

  CListSurveyViewModel.prototype.getDataContext = function(cb) {
    //@TODO: get real data context

    var _this = this,
      join = joiner(),
      priCustomer, premAddress, salesRep, details;

    // load primary customer
    dataservice.monitoringstationsrv.accounts.read({
      id: _this.accountid,
      link: 'customers/pri',
    }, function(val) {
      priCustomer = val;

      // load premise address
      dataservice.accountingengine.customers.read({
        id: priCustomer.CustomerID,
        link: 'addresses/prem',
      }, function(val) {
        premAddress = val;
      }, join.add());
    }, join.add());

    // load salesrep
    dataservice.monitoringstationsrv.accounts.read({
      id: _this.accountid,
      link: 'salesrep',
    }, function(val) {
      salesRep = val;
    }, join.add());

    // load details
    dataservice.monitoringstationsrv.accounts.read({
      id: _this.accountid,
      link: 'details',
    }, function(val) {
      details = val;
    }, join.add());


    join.when(function(err) {
      if (err) {
        cb(err);
        return;
      }
      var dataContext;
      dataContext = {
        CompanyName: 'Nexsense',
        ADUserDisplayName: config.user().Firstname,
        PrimaryCustomer: {
          FirstName: priCustomer.FirstName,
          LastName: priCustomer.LastName,
          FullName: strings.joinTrimmed(' ', priCustomer.Prefix, priCustomer.FirstName, priCustomer.MiddleName, priCustomer.LastName, priCustomer.Postfix),
          Phone1: priCustomer.PhoneHome || priCustomer.PhoneMobile || priCustomer.PhoneWork,
          Email: priCustomer.Email,
        },
        PremiseAddress: {
          Street: premAddress.StreetAddress,
          City: premAddress.City,
          State: premAddress.StateId,
          Zip: premAddress.PostalCode,
        },
        SystemDetails: {
          PremisePhone: premAddress.Phone || priCustomer.PhoneHome || priCustomer.PhoneMobile || priCustomer.PhoneWork, //@REVIEW: PremisePhone????
          PanelType: details.PanelTypeName,
          Password: details.AccountPassword,
          IsTwoWay: details.SystemTypeId === '2WAY',
          //@TODO: set these values below
          HasExistingEquipment: false,
          Interactive: false,
          // no tokens for these values
          // Csid: details.Csid,
          // ReceiverLineId: details.ReceiverLineId,
          // SystemTypeName: details.SystemTypeName,
          // CellularTypeName: details.CellularTypeName,
          // DslSeizure: details.DslSeizure,
        },
        ContractTerms: { //@TODO: load contract terms
          ContractLength: 60,
          BillingMethod: 2,
          MonthlyMonitoringFee: 49.99,
          TotalActivationFee: 199.99,
          ActivationFeePaymentMethod: 1,
          BillingDate: '15th',
          HasSalesUpgrades: true,
        },
        SalesRep: {
          FirstName: salesRep.PreferredName || salesRep.FirstName,
        },
      };

      cb(null, dataContext);
    });
  };

  function showTakeSurvey(_this, surveyid, locale, surveyResultView, retake, cb) {
    if (_this.loadingSurvey()) {
      cb();
      return;
    }

    function wrappedCb(err) {
      _this.loadingSurvey(false);
      cb(err);
    }
    _this.loadingSurvey(true);

    checkForCurrentSurvey(_this, function() {
      _this.getDataContext(function(err, dataContext) {
        if (err) {
          notify.notify('error', 'Error', err.Message);
          // don't pass along error, just notify we're done
          wrappedCb();
          return;
        }
        var vm = new TakeSurveyViewModel({
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
        vm.load({}, {}, wrappedCb);

        _this.gvm.setSelectedRows([]);
        _this.gvm.resetActiveCell();

        // store survey being taken
        _this.currentSurveyVm = vm;
      });
    }, wrappedCb);
  }

  function checkForCurrentSurvey(_this, yesCb, noCb) {
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
      link: 'surveyresults',
    }, gvm.list, cb);
  }

  return CListSurveyViewModel;
});
