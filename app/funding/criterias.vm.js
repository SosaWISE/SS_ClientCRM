define('src/funding/criterias.vm', [
  'src/dataservice',
  'src/funding/criteriasearch.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  CriteriaSearchViewModel,
  ko,
  utils,
  ControllerViewModel) {
  'use strict';

  function CriteriasViewModel(options) {
    // ** Initialize
    var _this = this;
    CriteriasViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm'
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
  utils.inherits(CriteriasViewModel, ControllerViewModel);
  CriteriasViewModel.prototype.viewTmpl = 'tmpl-funding-criterias';

  // ** Load event
  CriteriasViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.searchVm(new CriteriaSearchViewModel({
      pcontroller: _this,
      id: 'search',
      title: 'Search',
    }));
    _this.defaultChild = _this.searchVm.peek();

    join.add()();

  };

  // ** Return VM
  return CriteriasViewModel;
});
