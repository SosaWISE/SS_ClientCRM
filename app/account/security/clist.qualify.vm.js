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

    _this.title = ko.observable(_this.title);
    // _this.hideNotes = ko.observable(false);
    _this.step = ko.observable(0);

    _this.repModel = ko.observable();
    _this.addressModel = ko.observable();
    _this.customerModel = ko.observable();
    _this.creditResult = ko.observable();


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
            nextCmd.execute();
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
      return !busy && (_this.step() === 1 || _this.step() === 2);
    });
    _this.cmdCustomer = ko.command(function(cb) {
      showLayer(AccountRunCreditViewModel, function(customer, creditResult) {
        if (creditResult) {
          _this.customerModel(customer);
          _this.creditResult(creditResult);

          //
          // set new id and title on parent and update url
          //
          _this.pcontroller.id = creditResult.LeadId;
          _this.pcontroller.title(strings.format('{0}(Lead)', _this.pcontroller.id));
          _this.goTo(_this.getRouteData());
        }
      }, null, {
        addressId: _this.addressModel().AddressID,
        repModel: _this.repModel()
      }, true);
      cb();
    }, function(busy) {
      return !busy && _this.step() === 2;
    });

    _this.cmdCreateAccount = ko.command(function(cb) {
      dataservice.msaccountsetupsrv.accounts.post(null, {
        leadId: _this.creditResult().LeadId
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', 'Error', err.Message);
          return;
        }
        var checklistVm = _this.pcontroller;
        if (checklistVm.close() > -1) {
          _this.goTo({
            masterid: resp.Value.CustomerMasterFileId,
            id: resp.Value.AccountID,
            tab: 'checklist',
            p1: 'salesinfo',
          }, {
            checklist: checklistVm,
          });

          _this.canCreateAccount = false;
        } else {
          notify.notify('warn', 'unable to close??');
        }
        cb();
      });
    }, function(busy) {
      return !busy && _this.step() === 3 && _this.canCreateAccount && _this.customerModel() && _this.creditResult();
    });
  }
  utils.inherits(CListQualifyViewModel, ControllerViewModel);
  CListQualifyViewModel.prototype.viewTmpl = 'tmpl-security-clist_qualify';

  CListQualifyViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    // var _this = this,
    // _this.cmdFindRep.execute();
    join.add()();

    var _this = this,
      link, id;
    if (routeData.route === 'accounts') {
      link = 'account';
      id = routeData.id; //@TODO: get CustomerID.... or fix qualifyCustomerInfos endpoint
    } else if (routeData.id > 0) {
      link = 'lead';
      id = routeData.id;
    } else {
      // lead not saved yet
      return;
    }

    dataservice.qualify.qualifyCustomerInfos.read({
      id: id,
      link: link,
    }, null, utils.safeCallback(join.add(), function(err, resp) {
      resp = resp;
      console.log(resp.Value);
      var data = resp.Value;

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

      // load customer
      _this.customerModel({
        // normalize data
        CustomerName: data.CustomerName,
        SSN: data.SSN,
        DOB: data.DOB,
        Email: data.CustomerEmail,
      });

      // load credit
      // dataservice.qualify.creditReports.read({
      //   id: data.CreditReportID,
      // }, _this.creditResult, join.add());
      _this.creditResult({
        LeadId: data.LeadID,
        IsHit: data.IsHit,
        CreditGroup: data.CreditGroup,
        BureauName: data.BureauName,
      });

      //
      _this.step(3);
    }, utils.no_op));
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

  return CListQualifyViewModel;
});
