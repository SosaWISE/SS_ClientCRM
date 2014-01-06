define('src/account/vm.account', [
  'src/account/vm.salesinfo',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  SalesInfoViewModel,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  var count = 0;

  function AccountViewModel(options) {
    var _this = this;
    AccountViewModel.super_.call(_this, options);
    _this.ensureProps(['id', 'title']);

    _this.__count = count++;

    _this.testimg = ko.observable('http://lorempixel.com/480/360/');
    _this.title = ko.observable(_this.title);
    _this.rmr = ko.observable(_this.rmr);
    _this.hasRmr = ko.observable(_this.hasRmr);

    _this.depth = _this.depth || 0;
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(AccountViewModel, ControllerViewModel);
  AccountViewModel.prototype.viewTmpl = 'tmpl-account';

  AccountViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      _this.childs([
        salesInfoScreen(_this, _this.id + 1),
        salesInfoScreen(_this, _this.id + 2),
      ]);
      cb();
    }, 0);
  };

  function salesInfoScreen(pcontroller, id) {
    return new SalesInfoViewModel({
      pcontroller: pcontroller,
      routePart: 'tab',
      id: id,
      title: 'Sales Info',
    });
  }

  return AccountViewModel;
});
