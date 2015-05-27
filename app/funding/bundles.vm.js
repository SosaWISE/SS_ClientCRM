define("src/funding/bundles.vm", [
  "dataservice",
  "src/funding/bundlesearch.vm",
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  dataservice,
  BundleSearchViewModel,
  ko,
  utils,
  ControllerViewModel) {
  "use strict";

  function BundlesViewModel(options) {
    // ** Initialize
    var _this = this;
    BundlesViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm"
    ]);

    _this.searchVm = ko.observable();
    _this.list = _this.childs;

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm.peek());
    };
    _this.clickNew = function() {

    };
  }

  // ** Inherits
  utils.inherits(BundlesViewModel, ControllerViewModel);
  BundlesViewModel.prototype.viewTmpl = "tmpl-funding-bundles";

  BundlesViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.searchVm(new BundleSearchViewModel({
      pcontroller: _this,
      id: "search",
      title: "Search",
    }));
    _this.defaultChild = _this.searchVm.peek();

    join.add()();

  };

  // ** Return VM
  return BundlesViewModel;
});
