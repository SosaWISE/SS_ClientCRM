define("src/scrum/open2.vm", [
  "src/scrum/storys.vm",
  "src/core/relativesort",
  "src/slick/draghub",
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  StorysViewModel,
  RelativeSort,
  DragHub,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function Open2ViewModel(options) {
    var _this = this;
    Open2ViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
      "sprint",
      "storys",
      "tasks",
    ]);

    // set dragHub
    _this.pcontroller.dragHub = new DragHub({
      cancelEditOnDrag: true,
    });

    _this.coolerVm = StorysViewModel.create(_this, {
      accepts: function( /*item*/ ) {
        return false; //@TODO:
      },
      takes: function(item) {
        return (item.Points == null || item.SortOrder == null);
      },
      rsort: new RelativeSort({
        start: 0,
        increment: 5,
      }),
    });
    _this.backlogVm = StorysViewModel.create(_this, {
      accepts: function( /*item*/ ) {
        return true; //@TODO:
      },
      takes: function(item) {
        return (item.Points != null && item.SortOrder != null) && item.SortOrder < 0;
      },
      rsort: new RelativeSort({
        zero: (-1 << 30), // -1073741824
        increment: (1 << 14), // 16384
        max: -1,
      }),
    });
    _this.storyBoardVm = StorysViewModel.create(_this, {
      accepts: function( /*item*/ ) {
        return true; //@TODO:
      },
      takes: function(item) {
        return (item.Points != null && item.SortOrder != null) && item.SortOrder >= 0;
      },
      rsort: new RelativeSort({
        zero: (1 << 30), // 1073741824
        increment: (1 << 14), // 16384
        min: 1,
      }),
    });
    _this.vms = [_this.coolerVm, _this.backlogVm, _this.storyBoardVm];

    //
    // events
    //

    //
    // init
    //
    _this.vms.forEach(function(vm) {
      vm.beginUpdate();
    });
    //
    _this.storys.forEach(function(story) {
      _this.storyUpdated(story);
    });
    _this.tasks.forEach(function(task) {
      _this.taskUpdated(task);
    });
    //
    _this.vms.forEach(function(vm) {
      vm.endUpdate();
    });
  }
  utils.inherits(Open2ViewModel, ControllerViewModel);
  Open2ViewModel.prototype.viewTmpl = "tmpl-scrum_open";

  // Open2ViewModel.prototype.onLoad = function(routeData, extraData, join) {
  //   join.add()();
  // };

  Open2ViewModel.prototype.storyUpdated = function(story, select) {
    var _this = this;
    StorysViewModel.ensureItemMetadata(story, "s");

    var currVm = getCurrentVm(_this.vms, story._metadata.sid);
    var destVm = getStoryVm(_this.vms, story);

    if (currVm && currVm !== destVm) {
      // remove story and tasks if changing vm
      var items = currVm.removeItem(story);
      // add story and tasks that were removed above
      destVm.beginUpdate();
      items.forEach(function(item) {
        destVm.updateItem(item, false);
      });
      if (select) {
        destVm.updateItem(story, select);
      }
      destVm.endUpdate();
    } else {
      // update
      destVm.updateItem(story, select);
    }
  };
  Open2ViewModel.prototype.taskUpdated = function(task, select) {
    var _this = this;
    StorysViewModel.ensureItemMetadata(task, "t");
    // get vm by parent sid
    var currVm = getCurrentVm(_this.vms, task._metadata.psid);

    // update tree
    currVm.updateItem(task, select);
  };

  function getCurrentVm(vms, sid) {
    var result;
    vms.some(function(vm) {
      if (vm.getItem(sid)) {
        result = vm;
        return true;
      }
    });
    return result;
  }

  function getStoryVm(vms, story) {
    var result;
    vms.some(function(vm) {
      if (vm.takes(story)) {
        result = vm;
        return true;
      }
    });
    return result;
  }

  return Open2ViewModel;
});
