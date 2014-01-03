define('src/account/vm.account', [
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  function AccountViewModel(options) {
    var _this = this;
    AccountViewModel.super_.call(_this, options);
    _this.ensureProps(['id', 'title']);

    _this.testimg = ko.observable('http://lorempixel.com/480/360/');
    _this.title = ko.observable(_this.title);
    _this.rmr = ko.observable(_this.rmr);
    _this.hasRmr = ko.observable(_this.hasRmr);

    _this.depth = _this.depth || 0;
    _this.clickItem = function(vm) {
      _this.setActiveChild(vm);
    };
  }
  utils.inherits(AccountViewModel, ControllerViewModel);
  AccountViewModel.prototype.viewTmpl = 'tmpl-account';

  AccountViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: load real account
      cb(); // finish onload before adding childs so that the childs are lazy loaded
      if (_this.depth < 4) {
        _this.childs([
          createAccount(_this, 1, 'S1', 49.99, true),
          createAccount(_this, 6, 'S1', 49.99, true),
        ]);
      }
    }, 0);
  };
  // AccountViewModel.prototype.selectItem = function(vm) {
  //   var _this = this,
  //     routeData = vm.getLastRouteData();

  //   if (!routeData) {
  //     routeData = {};
  //     routeData[vm.routePart] = vm.id;
  //   }

  //   _this.goTo(routeData);
  // };

  function createAccount(parent, plus, title, rmr, hasRmr) {
    var id = parent.id,
      depth = parent.depth + 1;
    id = id + plus;
    return new AccountViewModel({
      pcontroller: parent,
      routePart: depth + '',
      depth: depth,
      id: id,
      title: title + id,
      rmr: rmr,
      hasRmr: hasRmr,
    });
  }

  return AccountViewModel;
});
