define('src/scrum/open.vm', [
  'src/scrum/story.editor.vm',
  'src/scrum/storyboard.gvm',
  'src/core/treelist',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  StoryEditorViewModel,
  StoryBoardGridViewModel,
  TreeList,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function OpenViewModel(options) {
    var _this = this;
    OpenViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
      'sprint',
      'storys',
    ]);

    _this.cooler = createSection(function(a, b) {
      // descending
      return b.ID - a.ID;
    }, function(item, cb) {
      _this.editItem('story', item, cb);
    });
    _this.backlog = createSection(function(a, b) {
      // descending
      return b.ProjectOrder - a.ProjectOrder;
    }, function(item, cb) {
      _this.editItem('story', item, cb);
    });
    _this.storyBoard = createSection(function(a, b) {
      // descending
      return b.ProjectOrder - a.ProjectOrder;
    }, function(item, cb) {
      _this.editItem('story', item, cb);
    });
    _this.sections = [_this.cooler, _this.backlog, _this.storyBoard];

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

  OpenViewModel.prototype.storyUpdated = function(story) {
    var _this = this,
      currSection, newSection;
    if (!story.sid) {
      // prep
      story.sid = 'us' + story.ID;
      story.psid = null;
    }
    // find current section
    _this.sections.some(function(s) {
      if (s.tree.has(story)) {
        currSection = s;
        return true;
      }
    });

    // decide new section
    if (story.Points == null || story.ProjectOrder == null) {
      // not prioritized
      newSection = _this.cooler;
    } else if (story.ProjectOrder < 0) {
      // not scheduled
      newSection = _this.backlog;
    } else {
      // scheduled and prioritized
      newSection = _this.storyBoard;
    }

    if (currSection && currSection !== newSection) {
      // remove if changing sections
      currSection.tree.remove(story);
    }
    // update tree
    newSection.tree.update(story);
    // update gvm
    newSection.gvm.updateGrid();
  };

  OpenViewModel.prototype.editItem = function(type, item, cb) {
    var _this = this,
      vm = _this.makeEditor(type, item);
    _this.layersVm.show(vm, function(result) {
      if (result) {
        switch (type) {
          default: throw new Error('invalid item type: ' + type);
          case 'story':
            _this.storyUpdated(result);
            break;
          case 'task':
            _this.taskUpdated(result);
            break;
        }
      }
      cb();
    });
  };
  OpenViewModel.prototype.makeEditor = function(type, item /*, parentId*/ ) {
    var vm;
    switch (type) {
      default: throw new Error('invalid item type: ' + type);
      case 'story':
        vm = new StoryEditorViewModel({
          item: utils.clone(item),
        });
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

  function createSection(comparer, editFn) {
    var tree = new TreeList(comparer);
    return {
      tree: tree,
      gvm: new StoryBoardGridViewModel({
        dataView: tree,
        edit: editFn,
      }),
    };
  }

  return OpenViewModel;
});
