define("src/contracts/contracts.panel.vm", [
  "src/contracts/master.vm",
  "src/account/default/search.vm",
  "ko",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  MasterViewModel,
  SearchViewModel,
  ko,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function ContractsPanelViewModel(options) {
    var _this = this;
    ContractsPanelViewModel.super_.call(_this, options);

    _this.searchVm = ko.observable();
    _this.list = _this.childs;

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm.peek());
    };
  }
  utils.inherits(ContractsPanelViewModel, ControllerViewModel);

  ContractsPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    function goToAccount(cmfid, id) {
      _this.goTo({
        route: "contracts",
        masterid: cmfid,
        id: id,
      });
    }

    _this.searchVm(new SearchViewModel({
      // routeName: "contracts",
      pcontroller: _this,
      id: "search",
      title: "Search",
      goToLead: goToAccount,
      goToAccount: goToAccount,
    }));
    _this.defaultChild = _this.searchVm.peek();

    join.add()();
  };

  ContractsPanelViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      searchVm, result, id;
    searchVm = _this.searchVm.peek();
    if (searchVm && routeData[searchVm.routePart] === searchVm.id) {
      result = searchVm;
    } else {
      result = ContractsPanelViewModel.super_.prototype.findChild.call(_this, routeData);
      if (!result) {
        // get child id
        id = routeData[_this.getChildRoutePart(routeData.route)];
        if (id > 0) {
          // add child
          result = createMasterVM(_this, id, id + '');
          _this.list.push(result);
        }
      }
    }
    return result;
  };

  function createMasterVM(pcontroller, id, name) {
    return new MasterViewModel({
      pcontroller: pcontroller,
      layersVm: pcontroller.layersVm,
      id: id,
      title: name,
      name: name,
    });
  }

  return ContractsPanelViewModel;
});
