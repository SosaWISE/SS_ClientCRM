define('src/account/vm.salesinfo', [
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko',
  'src/core/vm.combo',
], function(
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  function SalesInfoViewModel(options) {
    var _this = this;
    SalesInfoViewModel.super_.call(_this, options);

    // ** Fields
    _this.psComboVM = new ComboViewModel();
    _this.ctComboVM = new ComboViewModel();
    _this.apckComboVM = new ComboViewModel();
    _this.clComboVM = new ComboViewModel();
    _this.title = ko.observable(_this.title);

    //
    // events
    //
  }
  utils.inherits(SalesInfoViewModel, ControllerViewModel);
  SalesInfoViewModel.prototype.viewTmpl = 'tmpl-salesinfo';

  SalesInfoViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;
    load_pointsystems(_this, join.add());
    load_cellulartypes(_this, join.add());
    load_vendoralarmcompacakges(_this, join.add());
    load_contractlengthsget(_this, 1, join.add());
  };

  function load_pointsystems(_this, cb) {
    // ** Pull pointsystems
    dataservice.salessummary.pointsystems.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        var map = resp.Value.map(function(item) {
          return {
            text: item.TemplateName,
            value: item.InvoiceTemplateID
          };
        });
        _this.psComboVM.setList(map);
      }, cb);
    });
  }

  function load_cellulartypes(_this, cb) {
    // ** Pull Cellular Types
    dataservice.salessummary.cellulartypes.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        var map = resp.Value.map(function(item) {
          return {
            text: item.CellularTypeName,
            value: item.CellularTypeID
          };
        });
        _this.ctComboVM.setList(map);
      }, cb);
    });
  }

  function load_vendoralarmcompacakges(_this, cb) {
    // ** Pull alarm.com packages
    dataservice.salessummary.vendoralarmcompacakges.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind Data
        var map = resp.Value.map(function(item) {
          return {
            text: item.PackageName,
            value: item.AlarmComPackageID
          };
        });
        _this.apckComboVM.setList(map);
      }, cb);
    });
  }

  function load_contractlengthsget(_this, id, cb) {
    // ** Contract Length
    dataservice.salessummary.contractlengthsget.read({
      id: id,
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // Bind data
        var map = resp.Value.map(function(item) {
          return {
            text: item.ContractName,
            value: item.ContractTemplateID
          };
        });
        _this.clComboVM.setList(map);
      }, cb);
    });
  }

  return SalesInfoViewModel;
});
