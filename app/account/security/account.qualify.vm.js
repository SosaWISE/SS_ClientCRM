define('src/account/security/account.qualify.vm', [
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/account/default/rep.find.vm',
  'src/account/default/address.validate.vm',
  'src/account/default/runcredit.vm',
  'ko'
], function(
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  RepFindViewModel,
  AddressValidateViewModel,
  AccountRunCreditViewModel,
  ko
) {
  "use strict";

  function AccountQualifyViewModel(options) {
    var _this = this;
    AccountQualifyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.title = ko.observable(_this.title);
    _this.hideNotes = ko.observable(false);
    _this.hideRep = ko.observable(false);
    _this.hideEditor = ko.observable(false);
    _this.step = ko.observable(0);

    _this.repModel = ko.observable();
    _this.addressModel = ko.observable();
    _this.customerModel = ko.observable();
    _this.creditResult = ko.observable();


    //
    // events
    //
    function showLayer(Ctor, setter, nextCmd, options) {
      if (_this.layer) {
        return;
      }
      _this.layer = _this.layersVm.show(new Ctor(options), function onClose() {
        _this.layer = null;
        var args = ko.utils.makeArray(arguments);
        if (args[args.length - 1]) {
          _this.step(_this.step() + 1);
          setter.apply(null, args);
          if (ko.isCommand(nextCmd)) {
            nextCmd.execute();
          }
        }
      });
    }
    _this.cmdFindRep = ko.command(function(cb) {
      showLayer(RepFindViewModel, _this.repModel, _this.cmdAddress);
      cb();
    }, function(busy) {
      return !busy && _this.step() === 0;
    });
    _this.cmdAddress = ko.command(function(cb) {
      showLayer(AddressValidateViewModel, _this.addressModel, _this.cmdCustomer, {
        repModel: _this.repModel()
      });
      cb();
    }, function(busy) {
      return !busy && _this.step() === 1;
    });
    _this.cmdCustomer = ko.command(function(cb) {
      showLayer(AccountRunCreditViewModel, function(customer, creditResult) {
        if (creditResult) {
          _this.customerModel(customer);
          _this.creditResult(creditResult);
        }
      }, null, {
        addressId: _this.addressModel().AddressID,
        repModel: _this.repModel()
      });
      cb();
    }, function(busy) {
      return !busy && _this.step() === 2;
    });

    _this.cmdCreateAccount = ko.command(function(cb) {
      dataservice.monitoringstation.accounts.post(null, {
        leadId: _this.creditResult().LeadId
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', resp.Message);
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
  utils.inherits(AccountQualifyViewModel, ControllerViewModel);
  AccountQualifyViewModel.prototype.viewTmpl = 'tmpl-security-account_qualify';

  AccountQualifyViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // override me
    var _this = this;
    _this.cmdFindRep.execute();
  };
  AccountQualifyViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    var _this = this;
    _this.setLayerActive(true);
  };
  AccountQualifyViewModel.prototype.onDeactivate = function() { // overrides base
    var _this = this;
    _this.setLayerActive(false);
  };

  AccountQualifyViewModel.prototype.setLayerActive = function(active) {
    var vm, layer = this.layer;
    if (layer) {
      vm = layer.vm();
      if (vm) {
        vm.active(active);
      }
    }
  };

  return AccountQualifyViewModel;
});
