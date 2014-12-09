define('src/account/security/clist.qualify.vm', [
  'src/dataservice',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/account/default/rep.find.vm',
  'src/account/default/address.validate.vm',
  'src/account/default/runcredit.vm',
  'ko'
], function(
  dataservice,
  strings,
  notify,
  utils,
  ControllerViewModel,
  RepFindViewModel,
  AddressValidateViewModel,
  RunCreditViewModel,
  ko
) {
  "use strict";

  var steps = {
    SALES_REP: 0,
    ADDRESS: 1,
    PRI_LEAD: 2,
    SEC_LEAD: 3,
    CREATE_CUST: 4,
  };

  function CListQualifyViewModel(options) {
    var _this = this;
    CListQualifyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.mayReload = ko.observable(false);
    _this.title = ko.observable(_this.title);
    _this.step = ko.observable(steps.SALES_REP);

    _this.repModel = ko.observable();
    _this.addressModel = ko.observable();
    _this.customers = [
      createCustomerVm(_this, 'PRI', steps.PRI_LEAD), // 0
      createCustomerVm(_this, 'SEC', steps.SEC_LEAD), // 1
    ];

    //
    // events
    //
    _this.cmdFindRep = ko.command(function(cb) {
      showLayer(_this, RepFindViewModel, function(val) {
        _this.repModel(val);
        // step if a rep was found
        return !!val;
      }, _this.cmdAddress, null);
      cb();
    }, function(busy) {
      return !busy && _this.step() === steps.SALES_REP;
    });
    _this.cmdAddress = ko.command(function(cb) {
      showLayer(_this, AddressValidateViewModel, function(val) {
        if (val) {
          _this.addressModel(val);
          // step if is an address and we are still on the address step
          return _this.step.peek() === steps.ADDRESS;
        }
      }, _this.primaryCustCmd, {
        repModel: _this.repModel(),
        item: utils.clone(_this.addressModel()),
      });
      cb();
    }, function(busy) {
      var step = _this.step();
      return !busy && (step === steps.ADDRESS || step === steps.PRI_LEAD);
    });

    _this.cmdCreateAccount = ko.command(function(cb) {
      var primary = _this.customers[0];
      dataservice.msaccountsetupsrv.accounts.post(null, {
        CustomerMasterFileId: primary.lead().CustomerMasterFileId,
      }, null, function(err, resp) {
        if (err) {
          notify.error(err);
          cb();
          return;
        }
        var checklistVm = _this.pcontroller;
        if (checklistVm.close() > -1) {
          _this.goTo({
            route: 'accounts', // need to specify route since the current route is 'leads'
            masterid: resp.Value.CustomerMasterFileId,
            id: resp.Value.AccountID,
            tab: 'checklist',
            p1: 'salesinfo',
          }, {
            checklist: checklistVm,
          });

          _this.canCreateAccount = false;
        } else {
          notify.warn('unable to close??');
        }
        cb();
      });
    }, function(busy) {
      var primary = _this.customers[0];
      return !busy && _this.canCreateAccount && primary.lead() && primary.creditResult();
    });
  }
  utils.inherits(CListQualifyViewModel, ControllerViewModel);
  CListQualifyViewModel.prototype.viewTmpl = 'tmpl-security-clist_qualify';

  CListQualifyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      maxStep = steps.SALES_REP,
      id = routeData.masterid;

    load_localizations(_this, join.add());

    if (id <= 0) {
      // lead not saved yet
      return;
    }

    // get leads for master file
    dataservice.qualify.customerMasterFiles.read({
      id: id,
      link: 'leads',
    }, function(leads) {
      if (!leads.length) {
        return;
      }
      maxStep = steps.PRI_LEAD;

      // primary lead
      leads.some(function(lead) {
        if (lead.CustomerTypeId !== 'LEAD' && lead.CustomerTypeId !== 'PRI') {
          return false;
        }
        var cb = join.add();
        // load data
        load_qualifyCustomerInfos(lead.LeadID, null, utils.safeCallback(function(err) {
          if (true) {
            err = null;
          }
          cb(err);
        }, function(err, resp) {
          if (err) {
            notify.error(err, 10);
          }
          var creditResultAndStuff = resp.Value || {};
          if (creditResultAndStuff.IsHit) {
            // there is a primary lead credit result
            if (maxStep < steps.SEC_LEAD) {
              maxStep = steps.SEC_LEAD;
            }
          }

          // set data
          setCustomerData(_this.customers[0], lead, creditResultAndStuff);

          //
          //- use primary lead data for SalesRep and Premise Address.
          //- the secondary lead should have the same data,
          //   but it is possible for them to be different.
          //

          if (creditResultAndStuff.CompanyID) {
            // load sales rep
            dataservice.qualify.salesrep.read({
              id: creditResultAndStuff.CompanyID,
            }, _this.repModel, join.add());
          }
          if (creditResultAndStuff.AddressID) {
            // load address
            dataservice.qualify.addressValidation.read({
              id: creditResultAndStuff.AddressID,
            }, function(val) {
              // normalize data
              val.PhoneNumber = val.PhoneNumber || creditResultAndStuff.Phone;
              val.TimeZone = val.TimeZone || creditResultAndStuff.TimeZoneName;
              _this.addressModel(val);
            }, join.add());
          }
        }));
        // break loop
        return true;
      });

      // secondary lead
      leads.some(function(lead) {
        if (lead.CustomerTypeId !== 'SEC') {
          return false;
        }
        // load data
        load_qualifyCustomerInfos(lead.LeadID, function(creditResultAndStuff) {
          if (creditResultAndStuff && creditResultAndStuff.IsHit) {
            // there is a secondary lead credit result
            if (maxStep < steps.CREATE_CUST) {
              maxStep = steps.CREATE_CUST;
            }
          }

          // set data
          setCustomerData(_this.customers[1], lead, creditResultAndStuff);
        }, join.add());
        // break loop
        return true;
      });

    }, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.step(maxStep);
    });
  };
  CListQualifyViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    var _this = this;
    _this.setLayerActive(true);
  };
  CListQualifyViewModel.prototype.onDeactivate = function() { // overrides base
    var _this = this;
    _this.setLayerActive(false);
  };

  CListQualifyViewModel.prototype.setLayerActive = function(active) {
    var vm, layer = this.layer;
    if (layer) {
      vm = layer.vm();
      if (vm) {
        vm.active(active);
      }
    }
  };

  function load_qualifyCustomerInfos(leadID, setter, cb) {
    dataservice.qualify.qualifyCustomerInfos.read({
      id: leadID,
      link: 'lead',
    }, setter, cb);
  }

  function createCustomerVm(_this, customerTypeId, enabledStep) {
    var vm = {
      customerTypeId: customerTypeId,
      customerType: getCustomerTypeName(customerTypeId),
      lead: ko.observable(),
      creditResult: ko.observable(),
    };
    vm.cmdSendToIS = ko.command(function(cb) {
      dataservice.qualify.insideSales.save({
        id: vm.creditResult().LeadId,
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (resp.Message && resp.Message !== 'Success') {
          notify.error(resp, 3);
        }
      }, notify.iferror));
    }, function(busy) {
      return !busy && vm.creditResult();
    });

    vm.cmdCustomer = createCustCmd(_this, vm, enabledStep);

    return vm;
  }

  function createCustCmd(_this, cust, enabledStep) {
    return ko.command(function(cb) {
      showLayer(_this, RunCreditViewModel, function(lead, creditResult) {
        if (lead) {
          setCustomerData(cust, lead, creditResult);
          if (_this.pcontroller.id !== lead.CustomerMasterFileId) {
            //
            // set new id and title on parent and update url
            //
            _this.pcontroller.id = lead.CustomerMasterFileId;
            _this.pcontroller.title(lead.CustomerMasterFileId);
            _this.goTo(_this.getRouteData());
          }
          // step if there is a lead and a credit result
          return !!creditResult;
        }
      }, null, {
        addressId: _this.addressModel().AddressID,
        repModel: _this.repModel(),
        cache: _this.cache,
        customerTypeId: cust.customerTypeId,
        item: utils.clone(cust.lead.peek()),
        customerMasterFileId: (_this.pcontroller.id > 0) ? _this.pcontroller.id : 0,
      });
      cb();
    }, function(busy) {
      return !busy && _this.step() === enabledStep;
    });
  }

  function getCustomerTypeName(customerTypeId) {
    //@REVIEW: load from server?
    var customerType;
    switch (customerTypeId) {
      case 'LEAD':
      case 'PRI':
        customerType = 'Primary Customer';
        break;
      case 'SEC':
        customerType = 'Secondary Customer';
        break;
      default:
        return customerTypeId + ' Customer';
    }
    return customerType;
  }

  function setCustomerData(cust, lead, creditResultAndStuff) {
    // set customer
    lead.CustomerName = getCustomerName(lead);
    cust.lead(lead);

    // set credit
    if (!creditResultAndStuff || !creditResultAndStuff.IsHit) {
      cust.creditResult(null);
    } else {
      cust.creditResult({
        LeadId: creditResultAndStuff.LeadID,
        IsHit: creditResultAndStuff.IsHit,
        CreditGroup: creditResultAndStuff.CreditGroup,
        BureauName: creditResultAndStuff.BureauName,
      });
    }
  }

  function getCustomerName(data) {
    return strings.joinTrimmed(' ', data.Salutation, data.FirstName, data.MiddleName, data.LastName, data.Suffix);
  }

  function load_localizations(_this, cb) {
    _this.cache = _this.cache || {};
    _this.cache.localizations = [];
    dataservice.maincore.localizations.read({}, function(val) {
      _this.cache.localizations = val;
    }, cb);
  }

  function showLayer(_this, Ctor, setter, nextCmd, options) {
    if (_this.layer) {
      return;
    }
    _this.layer = _this.layersVm.show(new Ctor(options), function onClose() {
      _this.layer = null;
      var args = ko.utils.makeArray(arguments);
      if (setter.apply(null, args)) {
        _this.step(_this.step() + 1);

        if (ko.isCommand(nextCmd)) {
          nextCmd.execute.call();
        }
      }
    });
  }

  return CListQualifyViewModel;
});
