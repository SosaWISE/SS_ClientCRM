define('src/account/account.qualify.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/rep.find.vm',
  'src/address.validate.vm',
  'src/account/account.runcredit.vm',
  'ko'
], function(
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
    _this.creditModel = ko.observable();


    //
    // events
    //
    function showLayer(Ctor, setter, nextCmd, options) {
      if (_this.layer) {
        return;
      }
      _this.layer = _this.layersVm.show(new Ctor(options), function onClose(result) {
        _this.layer = null;
        if (result) {
          _this.step(_this.step() + 1);
          setter(result);
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
      showLayer(AddressValidateViewModel, _this.addressModel, _this.cmdCustomer);
      cb();
    }, function(busy) {
      return !busy && _this.step() === 1;
    });
    _this.cmdCustomer = ko.command(function(cb) {
      showLayer(AccountRunCreditViewModel, function(result) {
        if (result) {
          _this.customerModel(result.customer);
          _this.creditModel(result.creditResult);
        }
      }, null, {
        addressId: _this.addressModel().AddressID,
      });
      cb();
    }, function(busy) {
      return !busy && _this.step() === 2;
    });
  }
  utils.inherits(AccountQualifyViewModel, ControllerViewModel);
  AccountQualifyViewModel.prototype.viewTmpl = 'tmpl-account_qualify';

  AccountQualifyViewModel.prototype.onLoad = function( /*routeData, join*/ ) { // override me
    var _this = this;
    _this.cmdFindRep.execute();
  };
  AccountQualifyViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    var _this = this;
    _this.setLayerActive(true);
    // // this should be the last controller to be activated
    // routeCtx.done();
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
