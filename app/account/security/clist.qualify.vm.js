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
  AccountRunCreditViewModel,
  ko
) {
  "use strict";

  function CListQualifyViewModel(options) {
    var _this = this;
    CListQualifyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.mayReload = ko.observable(false);
    _this.title = ko.observable(_this.title);
    // _this.hideNotes = ko.observable(false);
    _this.step = ko.observable(0);

    _this.repModel = ko.observable();
    _this.addressModel = ko.observable();
    // _this.creditResult = ko.observable();
    _this.customers = [
      createCustomerVm('PRI'), // 0
      createCustomerVm('SEC'), // 1
    ];

    //
    // events
    //
    function showLayer(Ctor, setter, nextCmd, options, canMove) {
      if (_this.layer) {
        return;
      }
      _this.layer = _this.layersVm.show(new Ctor(options), function onClose() {
        _this.layer = null;
        var args = ko.utils.makeArray(arguments);
        if (args[args.length - 1]) {
          if (canMove) {
            _this.step(_this.step() + 1);
          }
          setter.apply(null, args);
          if (ko.isCommand(nextCmd)) {
            // call with first customer since cmdCustomer is expecting a customer as 'this'
            nextCmd.execute.call(_this.customers[0]);
          }
        }
      });
    }
    _this.cmdFindRep = ko.command(function(cb) {
      showLayer(RepFindViewModel, _this.repModel, _this.cmdAddress, null, true);
      cb();
    }, function(busy) {
      return !busy && _this.step() === 0;
    });
    _this.cmdAddress = ko.command(function(cb) {
      var item = utils.clone(_this.addressModel());
      showLayer(AddressValidateViewModel, _this.addressModel, _this.cmdCustomer, {
        repModel: _this.repModel(),
        item: item,
      }, !item);
      cb();
    }, function(busy) {
      var step = _this.step();
      return !busy && (step === 1 || step === 2);
    });
    _this.cmdCustomer = ko.command(function(cb) {
      var currentCustomer = this; // primary or secondary customer
      showLayer(AccountRunCreditViewModel, function(lead, creditResult) {
        if (creditResult) {
          lead.CustomerName = getCustomerName(lead);
          currentCustomer.lead(lead);
          currentCustomer.creditResult(creditResult);

          //
          // set new id and title on parent and update url
          //
          _this.pcontroller.id = lead.CustomerMasterFileId;
          _this.pcontroller.title(lead.CustomerMasterFileId);
          _this.goTo(_this.getRouteData());
        }
      }, null, {
        customerMasterFileId: (_this.pcontroller.id > 0) ? _this.pcontroller.id : 0,
        customerTypeId: currentCustomer.customerTypeId,
        item: utils.clone(currentCustomer.lead.peek()),
        addressId: _this.addressModel().AddressID,
        repModel: _this.repModel()
      }, true);
      cb();
    }, function(busy) {
      var step = _this.step();
      return !busy && (1 < step && step <= 3);
    });

    _this.cmdCreateAccount = ko.command(function(cb) {
      var primary = _this.customers[0];
      dataservice.msaccountsetupsrv.accounts.post(null, {
        leadId: primary.creditResult().LeadId
      }, null, function(err, resp) {
        if (err) {
          notify.error(err);
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
      var step = _this.step(),
        primary = _this.customers[0];
      return !busy && 3 < step && _this.canCreateAccount && primary.lead() && primary.creditResult();
    });
  }
  utils.inherits(CListQualifyViewModel, ControllerViewModel);
  CListQualifyViewModel.prototype.viewTmpl = 'tmpl-security-clist_qualify';

  CListQualifyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      id = routeData.masterid;
    if (id <= 0) {
      // lead not saved yet
      return;
    }

    // get leads for master file
    dataservice.qualify.customerMasterFiles.read({
      id: id,
      link: 'leads',
    }, function(leads) {
      // primary lead
      leads.some(function(lead) {
        if (lead.CustomerTypeId !== 'LEAD' && lead.CustomerTypeId !== 'PRI') {
          return false;
        }
        // there is a primary lead
        _this.step(3);
        // load data
        load_qualifyCustomerInfos(lead.LeadID, function(data) {
          // set data
          setCustomerData(_this.customers[0], data);

          //
          //- use primary lead data for SalesRep and Premise Address.
          //- the secondary lead should have the same data,
          //   but it is possible for them to be different.
          //

          // load sales rep
          dataservice.qualify.salesrep.read({
            id: data.CompanyID,
          }, _this.repModel, join.add());

          // load address
          dataservice.qualify.addressValidation.read({
            id: data.AddressID,
          }, function(val) {
            // normalize data
            val.PhoneNumber = val.PhoneNumber || data.Phone;
            val.TimeZone = val.TimeZone || data.TimeZoneName;
            _this.addressModel(val);
          }, join.add());
        }, join.add());
        // break loop
        return true;
      });

      // secondary lead
      leads.some(function(lead) {
        if (lead.CustomerTypeId !== 'SEC') {
          return false;
        }
        // there is a secondary lead
        _this.step(4);
        // load data
        load_qualifyCustomerInfos(lead.LeadID, function(data) {
          // set data
          setCustomerData(_this.customers[1], data);
        }, join.add());
        // break loop
        return true;
      });

    }, join.add());
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

  function createCustomerVm(customerTypeId) {
    var _this = {
      customerTypeId: customerTypeId,
      customerType: getCustomerTypeName(customerTypeId),
      lead: ko.observable(),
      creditResult: ko.observable(),
    };
    _this.cmdSendToIS = ko.command(function(cb) {
      dataservice.qualify.insideSales.save({
        id: _this.creditResult().LeadId,
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (resp.Message && resp.Message !== 'Success') {
          notify.error(resp, 3);
        }
      }, notify.error));
    }, function(busy) {
      return !busy && _this.creditResult();
    });

    return _this;
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

  function setCustomerData(cust, data) {
    // set customer
    cust.lead({
      // normalize data
      CustomerName: getCustomerName(data),
      SSN: data.SSN,
      DOB: data.DOB,
      Email: data.CustomerEmail,
    });

    // set credit
    cust.creditResult({
      LeadId: data.LeadID,
      IsHit: data.IsHit,
      CreditGroup: data.CreditGroup,
      BureauName: data.BureauName,
    });
  }

  function getCustomerName(data) {
    return strings.joinTrimmed(' ', data.Salutation, data.FirstName, data.MiddleName, data.LastName, data.Suffix);
  }

  return CListQualifyViewModel;
});
