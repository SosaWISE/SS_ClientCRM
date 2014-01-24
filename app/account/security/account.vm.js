define('src/account/security/account.vm', [
  'src/account/security/salesinfo.vm',
  'src/account/security/summary.vm',
  'src/account/security/inventory.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  SalesInfoViewModel,
  SummaryViewModel,
  InventoryViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  var childRoutePart = 'tab';

  function AccountViewModel(options) {
    var _this = this;
    AccountViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['id', 'title']);

    _this.title = ko.observable(_this.title);
    _this.rmr = ko.observable(_this.rmr);
    _this.hasRmr = ko.observable(_this.rmr() != null);
    _this.units = ko.observable(_this.units);

    _this.depth = _this.depth || 0;
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(AccountViewModel, ControllerViewModel);
  AccountViewModel.prototype.viewTmpl = 'tmpl-security-account';

  AccountViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      _this.childs([
        salesInfoScreen(_this, 'Sales Info'),
        createSummary(_this, 'Account Summary'),
        createFauxController(_this, 'EMC/Equipment'),
        createFauxController(_this, 'Signal History'),
        createInventory(_this, 'Inventory'),
        createFauxController(_this, 'Contract Approval'),
        createFauxController(_this, 'Setup Checklist'),
      ]);
      cb();
    }, 0);
  };

  function salesInfoScreen(pcontroller, title) {
    return new SalesInfoViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: titleToId(title),
      title: title,
    });
  }

  function createInventory(pcontroller, title) {
    return new InventoryViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: titleToId(title),
      title: title,
    });
  }

  function createSummary(pcontroller, title) {
    return new SummaryViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: titleToId(title),
      title: title,
    });
  }

  function createFauxController(pcontroller, title) {
    return new ControllerViewModel({
      pcontroller: pcontroller,
      routePart: childRoutePart,
      id: titleToId(title),
      title: title,
      viewTmpl: 'tmpl-temptitle',
    });
  }

  function titleToId(title) {
    return title.toLowerCase().replace(/\s+/g, '').replace(/\//g, '-');
  }

  return AccountViewModel;
});