define('src/scrum/open.vm', [
  'slick',
  'src/slick/draghub',
  'src/scrum/story.editor.vm',
  'src/scrum/cooler.gvm',
  'src/scrum/backlog.gvm',
  'src/scrum/storyboard.gvm',
  'src/core/treelist',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
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

  function OpenViewModel(options) {
    var _this = this,
      gridOptions;
    OpenViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
      'sprint',
      'storys',
    ]);

    gridOptions = {
      edit: _this.editItem.bind(_this),
      dragHub: new DragHub({
        cancelEditOnDrag: true,
      }),
    };

    _this.coolerGvm = new CoolerGridViewModel(gridOptions, _this);
    _this.backlogGvm = new BacklogGridViewModel(gridOptions, _this);
    _this.storyBoardGvm = new StoryBoardGridViewModel(gridOptions, _this);
    _this.grids = [_this.coolerGvm, _this.backlogGvm, _this.storyBoardGvm];

    //
    // events
    //

    //
    // init
    //
    options.storys.forEach(function(story) {
      _this.storyUpdated(story);
    });
  }
  utils.inherits(OpenViewModel, ControllerViewModel);
  OpenViewModel.prototype.viewTmpl = 'tmpl-scrum_open';

  OpenViewModel.prototype.onLoad = function(routeData, extraData, join) {
    join.add()();
  };

  OpenViewModel.prototype.storyUpdated = function(story, select) {
    var _this = this,
      currGrid, newGrid, index;
    if (!story.sid) {
      // prep
      story.sid = 'us' + story.ID;
      story.psid = null;
    }
    // find current and new grids
    _this.grids.some(function(gvm) {
      var tree = gvm.getData();
      if (!currGrid && tree.has(story)) {
        currGrid = gvm;
      }
      if (!newGrid && tree.takes(story)) {
        newGrid = gvm;
      }
      return currGrid && newGrid;
    });

    if (currGrid && currGrid !== newGrid) {
      // remove if changing grid
      currGrid.getData().remove(story);
      // deselect row
      currGrid.setSelectedRows([]);
    }
    // update tree
    newGrid.getData().update(story);
    if (select) {
      index = newGrid.getData().getItemIndex(story);
      newGrid.setSelectedRows([index]);
      newGrid.scrollRowIntoView(index);
    }
  };

  OpenViewModel.prototype.editItem = function(item, cb, editorOptions) {
    var _this = this,
      vm = _this.makeEditor(item, editorOptions),
      type = 'story'; //@TODO: get type from item
    _this.layersVm.show(vm, function(result) {
      if (result) {
        switch (type) {
          default: throw new Error('invalid item type: ' + type);
          case 'story':
            _this.storyUpdated(result, true);
            break;
          case 'task':
            _this.taskUpdated(result, true);
            break;
        }
      }
      cb();
    });
  };
  OpenViewModel.prototype.makeEditor = function(item, editorOptions /*, parentId*/ ) {
    var vm,
      type = 'story'; //@TODO: get type from item
    editorOptions = editorOptions || {};
    editorOptions.item = utils.clone(item);
    switch (type) {
      default: throw new Error('invalid item type: ' + type);
      case 'story':
        vm = new StoryEditorViewModel(editorOptions);
        break;
        // case 'task':
        //   vm = new TaskEditorViewModel({
        //     storyId: parentId,
        //     item: item,
        //     taskSteps: _this.taskSteps,
        //   });
        //   break;
    }
    return vm;
  };

  return OpenViewModel;
});
