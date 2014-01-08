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
    // ** Init
    var _this = this,
      cb = join.add();

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
        this.ctComboVM.setList(map);
      }, cb);
    });

    // ** Pull alarm.com packages
    dataservice.salessummary.vendoralarmcompacakges.read({}, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind Data
        var map = resp.Value.map(function(item) {
          return {
            text: item.PackageName,
            value: item.AlarmComPackageID
          };
        });
        this.apckComboVM.setList(map);
      }, cb);
    });

    // ** Contract Length
    dataservice.salessummary.contractlengthsget.read({}, function(err, resp) {
      utils.safeCallback(err, function() {
        // Bind data
        var map = resp.Value.map(function(item) {
          return {
            text: item.ContractName,
            value: item.ContractTemplateID
          };
        });
        this.clComboVM.setList(map);
      }, cb);
    });
  };

  return SalesInfoViewModel;
});