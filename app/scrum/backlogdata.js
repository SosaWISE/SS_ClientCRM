define('src/scrum/backlogdata', [
  'src/scrum/story.editor.vm',
  'src/core/relativesort',
  'src/core/treehelper',
  'src/core/notify',
  'ko',
  'src/core/utils',
  'src/core/ko.command', // no reference needed
], function(
  StoryEditorViewModel,
  RelativeSort,
  treehelper,
  notify,
  ko,
  utils
) {
  "use strict";

  var rsort = new RelativeSort();

  function returnOne() {
    return 1;
  }

  function returnZero() {
    return 0;
  }

  function sorter(a, b) {
    return a.sortOrder - b.sortOrder;
  }

  function insert(list, item, sorter) {
    // assumes the list is currently in order
    if (!list().some(function(b, index) {
      if (sorter(item, b) < 0) {
        // insert item
        list.splice(index, 0, item);
        return true;
      }
    })) {
      // add to end
      list.push(item);
    }
  }

  function getSidPrefix(type) {
    var prefix;
    switch (type) {
      case 'epic':
        prefix = 'E';
        break;
      case 'story':
        prefix = 'US';
        break;
      case 'step':
        prefix = 'TS';
        break;
      case 'task':
        prefix = 'T';
        break;
      default:
        throw new Error('unsupported type: ' + type);
    }
    return prefix;
  }

  function makeItemSid(item, type) {
    return getSidPrefix(type) + item.ID;
  }

  function mixinComputeLength(_this) {
    _this.length = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.length();
        }, 1);
      },
    });
  }

  function mixinComputePoints(_this) {
    _this.points = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.points();
        }, 0);
      },
    });
  }

  function BaseItemViewModel(container, item, type, hasChilds) {
    var _this = this;
    _this.container = container;
    _this.item = item;
    _this.type = type;
    _this.viewTmpl = 'tmpl-scrum_' + type;
    _this.sid = makeItemSid(item, type);
    _this.parentSid = _this.makeParentSid();
    _this.version = item.Version || 0;
    _this.sortOrder = item.SortOrder || 0;
    _this.length = returnOne;
    _this.points = returnZero;
    _this.childs = hasChilds ? ko.observableArray() : true; // true is a hack to stop treehelper from creating a childs array
  }
  BaseItemViewModel.prototype.makeParentSid = function() {
    var _this = this,
      item = _this.item,
      parentId, prefix;
    switch (_this.type) {
      case 'epic':
        if (_this.container.isBacklog) {
          parentId = item.ParentId;
          prefix = 'E';
        }
        break;
      case 'story':
        if (_this.container.isBacklog) {
          parentId = item.EpicId;
          prefix = 'E';
        }
        break;
      case 'step':
        parentId = item.ParentId;
        prefix = 'US';
        break;
      case 'task':
        parentId = item.TaskStepId;
        prefix = 'TS';
        break;
      default:
        throw new Error('unsupported type: ' + _this.type);
    }
    return parentId ? (prefix + parentId) : null;
  };
  BaseItemViewModel.prototype.update = function(item) {
    var _this = this,
      parent, sid = makeItemSid(item, _this.type);
    if (_this.sid && _this.sid !== sid) {
      throw new Error('mismatching sid\'s');
    }
    if (_this.version && _this.version > item.Version) {
      console.log('current version is greater than new Version');
      return false;
    }

    // remove from parent
    parent = _this.getParent();
    if (parent) {
      parent.removeChild(_this);
    }

    // update data
    _this.item = item;
    _this.parentSid = _this.makeParentSid();
    _this.version = item.Version || 0;
    _this.sortOrder = item.SortOrder || 0;

    //
    _this.onUpdate(item);

    // add to parent as child in correct order
    parent = _this.getParent();
    if (parent) {
      parent.addChild(_this);
      return true;
    } else {
      return false;
    }
  };
  BaseItemViewModel.prototype.onUpdate = function() {};
  BaseItemViewModel.prototype.getParent = function() {
    var _this = this,
      parentSid = _this.parentSid,
      container = _this.container;
    if (parentSid) {
      return container.sidToVmMap[parentSid];
    } else {
      return container;
    }
  };
  BaseItemViewModel.prototype.removeChild = function(vm) {
    var _this = this;
    return !!_this.childs.remove(vm).length;
  };
  BaseItemViewModel.prototype.addChild = function(vm) {
    var _this = this;
    insert(_this.childs, vm, sorter);
  };
  BaseItemViewModel.prototype.onDropSibling = function(vm) {
    var _this = this,
      prevSibling;

    // remove from parent
    vm.getParent().removeChild(vm);

    // update data
    // set parentSid
    vm.parentSid = _this.parentSid;
    // change sortOrder
    prevSibling = _this.getPrevSibling();
    vm.sortOrder = rsort.getIntSort(prevSibling ? prevSibling.sortOrder : null, _this.sortOrder);

    // add to parent as child in correct order
    vm.getParent().addChild(vm);

    // save
    //@TODO: save
  };
  BaseItemViewModel.prototype.getPrevSibling = function() {
    var _this = this,
      list = _this.getParent().childs(),
      result;
    list.some(function(item, index) {
      if (_this === item) {
        result = list[index - 1];
        return true;
      }
    });
    return result;
  };
  BaseItemViewModel.prototype.onDropChild = function(vm) {
    var _this = this,
      lastChild;

    // remove from parent
    vm.getParent().removeChild(vm);

    // set parentSid
    vm.parentSid = _this.sid;
    // change sortOrder
    lastChild = _this.getLastChild();
    vm.sortOrder = rsort.getIntSort(lastChild ? lastChild.sortOrder : null, null);

    // add to parent as child in correct order
    vm.getParent().addChild(vm);

    // save
    //@TODO: save
  };
  BaseItemViewModel.prototype.getLastChild = function() {
    var _this = this,
      list = _this.childs();
    return list[list.length - 1];
  };

  function EpicViewModel(container, item, type) {
    var _this = this;
    if (type !== 'epic') {
      throw new Error('item must be an epic');
    }
    EpicViewModel.super_.call(_this, container, item, type, true);

    mixinComputeLength(_this);
    mixinComputePoints(_this);
  }
  utils.inherits(EpicViewModel, BaseItemViewModel);
  // EpicViewModel.prototype.onUpdate = function(item) {};

  function StoryViewModel(container, item, type) {
    var _this = this;
    if (type !== 'story') {
      throw new Error('item must be a story');
    }
    StoryViewModel.super_.call(_this, container, item, type, true);

    mixinComputeLength(_this);
    _this.points = ko.observable(item.Points);

    _this.tasks = ko.computed({
      deferEvaluation: true,
      read: function() {
        var tasks = [];
        // steps
        _this.childs().forEach(function(step) {
          // tasks
          step.childs().forEach(function(task) {
            tasks.push(task);
          });
        });
        return tasks;
      },
    });

    //
    // events
    //
    _this.cmdEdit = ko.command(function(cb) {
      var vm = new StoryEditorViewModel({
        item: utils.clone(_this.item),
        epics: _this.container.getEpics(),
        sprints: [],
      });
      _this.container.layersVm.show(vm, function(result) {
        console.log(result);
        if (result) {
          //@TODO: use correct update function
          _this.container.updateItem(result, 'story');
        }
        cb();
      });
    });
  }
  utils.inherits(StoryViewModel, BaseItemViewModel);
  StoryViewModel.prototype.onUpdate = function(item) {
    var _this = this;
    _this.points(item.Points);
  };

  function StepViewModel(container, item, type) {
    var _this = this;
    if (type !== 'step') {
      throw new Error('item must be a step');
    }
    StepViewModel.super_.call(_this, container, item, type, true);

    mixinComputeLength(_this);
  }
  utils.inherits(StepViewModel, BaseItemViewModel);
  StepViewModel.prototype.onAccept = function(testVm) {
    var _this = this;
    return (testVm instanceof TaskViewModel) &&
      testVm.item.StoryId === _this.item.ParentId;
  };

  function TaskViewModel(container, item, type) {
    var _this = this;
    if (type !== 'task') {
      throw new Error('item must be a task');
    }
    TaskViewModel.super_.call(_this, container, item, type, false);
  }
  utils.inherits(TaskViewModel, BaseItemViewModel);
  TaskViewModel.prototype.onAccept = function(testVm) {
    var _this = this;
    return (testVm instanceof TaskViewModel) &&
      testVm.item.StoryId === _this.item.StoryId;
  };

  function BacklogData(options) {
    var _this = this;
    // EpicViewModel.super_.call(_this, null, null, 'backlog');
    options = options || {};

    _this.layersVm = options.layersVm;
    _this.isBacklog = options.isBacklog || false;

    _this._initialized = false;
    _this.sidToVmMap = {};
    _this.length = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.length();
        }, 0);
      },
    });
    _this.childs = ko.observableArray();
  }
  utils.inherits(BacklogData, BaseItemViewModel);
  BacklogData.prototype.removeChild = BaseItemViewModel.prototype.removeChild;
  BacklogData.prototype.addChild = BaseItemViewModel.prototype.addChild;

  BacklogData.prototype.updateItem = function(item, type) {
    // ensure items have correct parent ids
    switch (type) {
      case 'task':
        if (typeof(item.TaskStepId) === 'number') {
          item.TaskStepId = item.TaskStepId + '_' + getSidPrefix('story') + item.StoryId;
        }
        break;
    }

    var _this = this,
      sidToVmMap = _this.sidToVmMap,
      vm = _this.makeVm(item, type),
      currVm = sidToVmMap[vm.sid],
      added = false;

    if (_this._initialized) {
      if (currVm) {
        if (currVm.version <= vm.version) {
          vm = currVm;
        } else {
          console.log('current version is greater than new version');
          return added;
        }
      }

      added = vm.update(item);
      if (!currVm && added) {
        sidToVmMap[vm.sid] = vm;
      }
    } else if (!currVm || currVm.version <= vm.version) {
      // just add to map since it's not yet initialized
      sidToVmMap[vm.sid] = vm;
      added = true;
    }

    // update or add item childs, if any
    if (added) {
      switch (type) {
        case 'story':
          // update or add steps
          buildStorySteps(_this, item).forEach(function(step) {
            _this.updateItem(step, 'step');
          });
          // update or add tasks
          if (item.Tasks && Array.isArray(item.Tasks)) {
            item.Tasks.forEach(function(task) {
              task.StoryId = task.StoryId || item.ID;
              _this.updateItem(task, 'task');
            });
            delete item.Tasks;
          }
          break;
      }
    }

    return added;
  };
  BacklogData.prototype.removeItem = function(item, type) {
    if (type !== 'story') {
      throw new Error('only storys can be removed');
    }

    var _this = this,
      sidToVmMap = _this.sidToVmMap,
      sid = makeItemSid(item, type),
      currVm = sidToVmMap[sid];

    if (!currVm) {
      return false;
    }

    delete sidToVmMap[sid];
    // recursively delete childs from map
    (function deleteChlds(childs) {
      if (!childs || childs === true) {
        return;
      }
      childs().forEach(function(item) {
        delete sidToVmMap[item.sid];
        deleteChlds(item.childs);
      });
    })(currVm.childs);
    return currVm.getParent().removeChild(currVm);
  };

  BacklogData.prototype.makeVm = function(item, type) {
    var _this = this,
      Ctor;
    switch (type) {
      case 'epic':
        Ctor = EpicViewModel;
        break;
      case 'story':
        Ctor = StoryViewModel;
        break;
      case 'step':
        Ctor = StepViewModel;
        break;
      case 'task':
        Ctor = TaskViewModel;
        break;
      default:
        throw new Error('unsupported type: ' + type);
    }
    return new Ctor(_this, item, type);
  };
  BacklogData.prototype.init = function(epics, storys) {
    var _this = this,
      sidToVmMap = _this.sidToVmMap,
      childs, list, orphans = [];

    if (_this._initialized) {
      throw new Error('already initialized');
    }

    _this.taskSteps = [
      {
        ID: 1,
        Name: 'To Do',
      },
      {
        ID: 2,
        Name: 'In Progress',
      },
      {
        ID: 3,
        Name: 'Done',
      },
      {
        ID: 4,
        Name: 'Approved',
      },
    ];

    function updateList(list, type) {
      list.forEach(function(item) {
        _this.updateItem(item, type);
      });
    }
    updateList(epics, 'epic');
    updateList(storys, 'story');

    _this._initialized = true;

    // turn map back into a list
    list = Object.keys(sidToVmMap).map(function(key) {
      return sidToVmMap[key];
    });

    // sort epics and storys
    list.sort(sorter);
    // wrap them and create tree
    childs = treehelper.makeTree(list, 'sid', 'parentSid', null, null, null, orphans);
    orphans.forEach(function(item) {
      insert(childs, item, sorter);
    });

    _this.childs(childs);
  };

  function addEpics(item, epics) {
    item.childs().some(function(vm) {
      if (vm.type === 'epic') {
        epics.push({
          ID: vm.item.ID,
          Name: vm.item.Name,
        });
        addEpics(vm, epics);
      }
    });
  }
  BacklogData.prototype.getEpics = function() {
    var _this = this,
      epics = [];
    addEpics(_this, epics);
    return epics;
  };

  function buildStorySteps(_this, story) {
    var storySid = makeItemSid(story, 'story');
    return _this.taskSteps.map(function(taskStep) {
      return {
        ParentId: story.ID,
        ID: taskStep.ID + '_' + storySid,
        Name: taskStep.Name,
        Version: 0,
        SortOrder: taskStep.ID,
      };
    });
  }

  function findItemAtIndex(item, indexObj) {
    var result;
    if (indexObj.index === 0) {
      result = item;
      return result;
    }

    item.childs().some(function(item) {
      if (indexObj.index <= item.length()) {
        indexObj.index--;
        result = findItemAtIndex(item, indexObj);
        if (!result) {
          console.warn('expected to find a result');
        }
        if (indexObj.index !== 0) {
          console.warn('expected index to be 0');
        }
        return true; // break loop
      } else {
        indexObj.index -= item.length();
      }
    });
    return result;
  }
  BacklogData.prototype.getItem = function(index) {
    var _this = this;
    if (index < 0 || _this.length() <= index) {
      throw new Error('index outside of bounds');
    }
    return findItemAtIndex(_this, {
      index: index + 1
    });
  };

  return BacklogData;
});
