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

    var gridOptions = {
      edit: _this.editItem.bind(_this),
      dragHub: new DragHub({
        cancelEditOnDrag: true,
      }),
    };

    _this.coolerVm = createStorysVm(_this, gridOptions, {
      accepts: function(item, parent, prev, next) {
        return next !== next; //@TODO:
      },
      takes: function(item) {
        return (item.Points == null || item.SortOrder == null);
      },
      rsort: new RelativeSort({
        start: 0,
        increment: 5,
      }),
    });
    _this.backlogVm = createStorysVm(_this, gridOptions, {
      accepts: function(item, parent, prev, next) {
        return next === next; //@TODO:
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
    _this.storyBoardVm = createStorysVm(_this, gridOptions, {
      accepts: function(item, parent, prev, next) {
        return next === next; //@TODO:
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

  Open2ViewModel.prototype.onLoad = function(routeData, extraData, join) {
    join.add()();
  };

  Open2ViewModel.prototype.storyUpdated = function(story, select) {
    var _this = this,
      curr, dest;
    if (!story._metadata) {
      // prep
      story.sid = "s" + story.ID;
      story.psid = null;
      story._metadata = {
        collapsed: false,
        indent: 1,
      };
    }
    curr = getCurrentVm(_this.vms, story.sid);
    dest = getStoryVm(_this.vms, story);

    if (curr && curr !== dest) {
      // remove if changing
      curr.removeItem(story);
      //@TODO: remove sub-tasks
    }
    // update tree
    dest.updateItem(story, select);
    //@TODO: add sub-tasks that were removed above
  };
  Open2ViewModel.prototype.taskUpdated = function(task, select) {
    var _this = this;
    if (!task._metadata) {
      // prep
      task.sid = "t" + task.ID;
      task.psid = "s" + task.StoryId;
      task._metadata = {
        collapsed: false,
        indent: 2,
      };
    }
    // get vm by parent sid
    var vm = getCurrentVm(_this.vms, task.psid);

    // update tree
    vm.updateItem(task, select);
  };

  Open2ViewModel.prototype.editItem = function(item, cb, editorOptions) {
    var _this = this,
      vm = _this.makeEditor(item, editorOptions),
      type = "story"; //@TODO: get type from item
    _this.layersVm.show(vm, function(result) {
      if (result) {
        switch (type) {
          case "story":
            _this.storyUpdated(result, true);
            break;
          case "task":
            _this.taskUpdated(result, true);
            break;
          default:
            throw new Error("invalid item type: " + type);
        }
      }
      cb();
    });
  };
  Open2ViewModel.prototype.makeEditor = function(item, editorOptions /*, parentId*/ ) {
    var vm,
      type = "story"; //@TODO: get type from item
    editorOptions = editorOptions || {};
    editorOptions.item = utils.clone(item);
    switch (type) {
      case "story":
        vm = new StoryEditorViewModel(editorOptions);
        break;
        // case "task":
        //   vm = new TaskEditorViewModel({
        //     storyId: parentId,
        //     item: item,
        //     taskSteps: _this.taskSteps,
        //   });
        //   break;
      default:
        throw new Error("invalid item type: " + type);
    }
    return vm;
  };

  function createStorysVm(_this, gridOptions, options) {
    return new StorysViewModel({
      pcontroller: _this,
      gridOptions: gridOptions,

      indentOffset: utils.ifNull(options.indentOffset, -1), // default to -1
      accepts: options.accepts,
      takes: options.takes,
      rsort: options.rsort,
      // edit: _this.editItem.bind(_this),
      // dragHub: new DragHub({
      //   cancelEditOnDrag: true,
      // }),
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
