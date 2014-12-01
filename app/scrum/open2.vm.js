define("src/scrum/open2.vm", [
  'src/core/relativesort',
  "src/scrum/storys.vm",
  "slick",
  "src/slick/draghub",
  "src/scrum/story.editor.vm",
  "src/scrum/cooler.gvm",
  "src/scrum/backlog.gvm",
  "src/scrum/storyboard.gvm",
  "src/core/treelist",
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  RelativeSort,
  StorysViewModel,
  Slick,
  DragHub,
  StoryEditorViewModel,
  CoolerGridViewModel,
  BacklogGridViewModel,
  StoryBoardGridViewModel,
  TreeList,
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

    _this.coolerVm = createStorysVm(_this, {
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
    _this.backlogVm = createStorysVm(_this, {
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
    _this.storyBoardVm = createStorysVm(_this, {
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
    ensureItemMetadata(story, "s");

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
    ensureItemMetadata(task, "t");
    // get vm by parent sid
    var currVm = getCurrentVm(_this.vms, task._metadata.psid);

    // update tree
    currVm.updateItem(task, select);
  };

  function ensureItemMetadata(item, type, currVm) {
    if (item._metadata) {
      return;
    }
    var metadata, sid = type + item.ID;

    if (currVm && currVm.getItem(sid)) {
      metadata = currVm.getItem(sid)._metadata;
    } else {
      metadata = {
        sid: sid,
        psid: null,
        type: type,
        collapsed: false,
        indent: 0,
      };
    }

    switch (type) {
      case "s":
        metadata.indent = 1;
        // metadata.psid = null;
        break;
      case "t":
        metadata.indent = 2;
        metadata.psid = "s" + item.StoryId;
        break;
      default:
        throw new Error("invalid type:" + item._metadata.type);
    }

    item._metadata = metadata;
    item.sid = metadata.sid; // needed for DataView
  }

  function createStorysVm(_this, options) {
    // ensure dragHub
    _this.dragHub = _this.dragHub || new DragHub({
      cancelEditOnDrag: true,
    });
    //
    return new StorysViewModel({
      pcontroller: _this,
      indentOffset: utils.ifNull(options.indentOffset, -1), // default to -1
      accepts: options.accepts,
      takes: options.takes,
      rsort: options.rsort,
    });
  }

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
