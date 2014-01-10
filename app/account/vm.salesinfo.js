define('src/account/vm.salesinfo', [
  'src/core/vm.slickgrid',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko',
  'src/core/vm.combo',
], function(
  SlickGridViewModel,
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
    _this.psComboVM = new ComboViewModel({
      fields: {
        text: 'TemplateName',
        value: 'InvoiceTemplateID',
      }
    });
    _this.ctComboVM = new ComboViewModel({
      nullable: true,
      fields: {
        text: 'CellularTypeName',
        value: 'CellularTypeID',
      }
    });
    _this.apckComboVM = new ComboViewModel({
      fields: {
        text: 'PackageName',
        value: 'AlarmComPackageID',
      }
    });
    _this.clComboVM = new ComboViewModel({
      fields: {
        text: 'ContractName',
        value: 'ContractTemplateID',
      }
    });
    _this.title = ko.observable(_this.title);

    _this.psComboVM.selectedValue.subscribe(function(value) {
      _this.clComboVM.setList([]);
      dataservice.salessummary.contractlengthsget.read({
        id: value,
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
          return;
        }
        if (_this.psComboVM.selectedValue() === value) {
          // only set if same as current selected value
          _this.clComboVM.setList(resp.Value);
        }
      });
    });

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
  };

  function load_pointsystems(_this, cb) {
    // ** Pull pointsystems
    dataservice.salessummary.pointsystems.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        _this.psComboVM.setList(resp.Value);
        _this.psComboVM.selectItem(_this.psComboVM.list()[0]);
      }, cb);
    });
  }

  function load_cellulartypes(_this, cb) {
    // ** Pull Cellular Types
    dataservice.salessummary.cellulartypes.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        _this.ctComboVM.setList(resp.Value);
      }, cb);
    });
  }

  function load_vendoralarmcompacakges(_this, cb) {
    // ** Pull alarm.com packages
    dataservice.salessummary.vendoralarmcompacakges.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind Data
        _this.apckComboVM.setList(resp.Value);
      }, cb);
    });
  }

  return SalesInfoViewModel;
});
