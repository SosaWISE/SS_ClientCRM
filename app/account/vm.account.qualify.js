define('src/account/vm.account.qualify', [
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'src/vm.rep.find',
  'src/vm.address.validate',
  'src/account/vm.account.runcredit',
  'ko'
], function(
  notify,
  utils,
  ControllerViewModel,
  FindRepViewModel,
  ValidateAddressViewModel,
  RunCreditAccountViewModel,
  ko
) {
  "use strict";

  function QualifyAccountViewModel(options) {
    var _this = this;
    QualifyAccountViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVM']);

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
      _this.layer = _this.layersVM.show(new Ctor(options), function onClose(result) {
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
      showLayer(FindRepViewModel, _this.repModel, _this.cmdAddress);
      cb();
    }, function(busy) {
      return !busy && _this.step() === 0;
    });
    _this.cmdAddress = ko.command(function(cb) {
      showLayer(ValidateAddressViewModel, _this.addressModel, _this.cmdCustomer);
      cb();
    }, function(busy) {
      return !busy && _this.step() === 1;
    });
    _this.cmdCustomer = ko.command(function(cb) {
      showLayer(RunCreditAccountViewModel, function(result) {
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
  utils.inherits(QualifyAccountViewModel, ControllerViewModel);
  QualifyAccountViewModel.prototype.viewTmpl = 'tmpl-account_qualify';

  QualifyAccountViewModel.prototype.onLoad = function( /*routeData, join*/ ) { // override me
    var _this = this;
    _this.cmdFindRep.execute();
  };
  QualifyAccountViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    var _this = this;
    _this.setLayerActive(true);
    // // this should be the last controller to be activated
    // routeCtx.done();
  };
  QualifyAccountViewModel.prototype.onDeactivate = function() { // overrides base
    var _this = this;
    _this.setLayerActive(false);
  };

  QualifyAccountViewModel.prototype.setLayerActive = function(active) {
    var vm, layer = this.layer;
    if (layer) {
      vm = layer.vm();
      if (vm) {
        vm.active(active);
      }
    }
  };

  return QualifyAccountViewModel;
});
