define('src/scrum/open.vm', [
  'src/scrum/storyboard.gvm',
  'src/core/treelist',
  'ko',
  'src/core/layers.vm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  StoryBoardGridViewModel,
  TreeList,
  ko,
  LayersViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";

  function OpenViewModel(options) {
    var _this = this;
    OpenViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['sprint', 'storys']);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.cooler = createSection(function(a, b) {
      // descending
      return b.ID - a.ID;
    });
    _this.backlog = createSection(function(a, b) {
      // descending
      return b.ProjectOrder - a.ProjectOrder;
    });
    _this.storyBoard = createSection(function(a, b) {
      // descending
      return b.ProjectOrder - a.ProjectOrder;
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

  function createSection(comparer) {
    var tree = new TreeList(comparer);
    return {
      tree: tree,
      gvm: new StoryBoardGridViewModel({
        dataView: tree,
      }),
    };
  }

  return OpenViewModel;
});
