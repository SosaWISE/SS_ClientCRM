define("src/scheduler/techs.vm", [
  "src/scheduler/scheduler-cache",
  "src/scheduler/tech.vm",
  "jquery",
  "ko",
  "dataservice",
  "src/ukov",
  "src/core/joiner",
  "src/core/combo.vm",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  schedulercache,
  TechViewModel,
  jquery,
  ko,
  dataservice,
  ukov,
  joiner,
  ComboViewModel,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  //
  //
  //
  function TechsViewModel(options) {
    var _this = this;
    TechsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
    ]);
    utils.setIfNull(_this, {

    });
    _this.showNav = ko.observable(true);

    _this.techVm = _this.activeChild;
    _this.techsCvm = new ComboViewModel({
      fields: {
        value: "RecruitId",
        text: function(item) {
          return strings.format("{0} ({1} - R{2} - {3})",
            item.FullName, item.GPEmployeeID, item.RecruitId, item.SeasonName);
        },
      },
      afterWrap: function(wrappedItem) {
        wrappedItem.vm = ko.observable();
      },
    });

    //
    // events
    //
    // _this.clickTech = function(item) {
    //   _this.techsCvm.selected(item);
    // };
  }
  utils.inherits(TechsViewModel, ControllerViewModel);
  TechsViewModel.prototype.viewTmpl = "tmpl-scheduler-techs";

  //
  // members
  //

  TechsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    schedulercache.ensure("techs", join.add());
    join.when(function(err) {
      if (err) {
        return;
      }
      _this.techsCvm.setList(utils.clone(schedulercache.getList("techs").peek()));
      _this.techsCvm.selectedValue(parseInt(routeData.id, 10));
      _this.techsCvm.selected.subscribe(function(selected) {
        if (!selected || selected === _this.techsCvm.noItemSelected) {
          return;
        }
        //@REVIEW: is this logic helpful or annoying???
        var vm = null; //selected.vm.peek();
        var routeData = (vm || _this).getRouteData();
        routeData.id = selected.value;
        _this.goTo(routeData);
      });
    });
  };
  TechsViewModel.prototype.findChild = function(routeData) { // overrides base
    var _this = this;
    var routeVal = routeData[_this.getChildRoutePart()];
    if (!routeVal) {
      return;
    }
    var result;
    _this.techsCvm.list.peek().some(function(wrappedItem) {
      var id = wrappedItem.value;
      /* jshint eqeqeq:false */ // 10001 == "10001"
      if (id == routeVal) {
        var vm = wrappedItem.vm.peek();
        if (!vm) {
          vm = new TechViewModel({
            // routeName: "scheduler",
            pcontroller: _this,
            id: id,
            item: utils.clone(wrappedItem.item),
            layersVm: _this.layersVm,
          });
          wrappedItem.vm(vm);
        }
        result = vm;
        return result;
      }
    });
    return result;
  };


  return TechsViewModel;
});
