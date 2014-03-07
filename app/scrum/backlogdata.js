define('src/scrum/backlogdata', [
  'slick',
  'src/scrum/epic.editor.vm',
  'src/scrum/task.editor.vm',
  'src/scrum/story.editor.vm',
  'src/core/relativesort',
  'src/core/treehelper',
  'src/core/notify',
  'ko',
  'src/core/utils',
  'src/core/ko.command', // no reference needed
], function(
  Slick,
  EpicEditorViewModel,
  TaskEditorViewModel,
  StoryEditorViewModel,
  RelativeSort,
  treehelper,
  notify,
  ko,
  utils
) {
  "use strict";

  var rsort = new RelativeSort();

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
        prefix = 'ST';
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

  // function mixinComputeLength(_this, startLength) {
  //   startLength = startLength || 0;
  //   _this.length = ko.computed({
  //     deferEvaluation: true,
  //     read: function() {
  //       return _this.childs().reduce(function(current, value) {
  //         return current + value.length();
  //       }, startLength);
  //     },
  //   });
  // }

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
    _this.childs = hasChilds ? ko.observableArray() : true; // true is a hack to stop treehelper from creating a childs array
    _this.showMenu = ko.observable(false);
    _this.depth = ko.observable(0);
  }
  BaseItemViewModel.prototype.canMove = true;
  BaseItemViewModel.prototype.startLength = 1;
  BaseItemViewModel.prototype.length = function() {
    return this.startLength;
  };
  BaseItemViewModel.prototype.points = function() {
    return 0;
  };
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
        parentId = item.TaskStepSid;
        prefix = 'ST';
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
  BaseItemViewModel.prototype.updateComputables = function(recursive) {
    // recursively tell children to update length
    // once the children have the correct length
    // the parent's(_this) length can be calculated
    var _this = this,
      length = _this.startLength;
    if (_this.childs !== true) {
      length = _this.childs().reduce(function(current, child) {
        if (recursive) {
          child.updateComputables(recursive);
        }
        return current + (child.length() || child.startLength);
      }, length);
    }
    _this.length(length);
  };
  BaseItemViewModel.prototype.updateUpComputables = function() {
    var _this = this;
    _this.updateComputables();
    _this.getParent().updateUpComputables();
  };
  BaseItemViewModel.prototype.removeChild = function(vm) {
    var _this = this,
      removed = _this.childs.remove(vm).length > 0;
    _this.updateUpComputables();
    return removed;
  };
  BaseItemViewModel.prototype.addChild = function(vm) {
    var _this = this;
    insert(_this.childs, vm, sorter);
    _this.updateUpComputables();
    // update all children depths
    vm.updateDepth(_this.depth() + 1);
  };
  BaseItemViewModel.prototype.updateDepth = function(depth) {
    var _this = this;
    _this.depth(depth);
    if (_this.childs !== true) {
      // update all children depths
      depth += 1;
      _this.childs().forEach(function(child) {
        child.updateDepth(depth);
      });
    }
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
  BaseItemViewModel.prototype.getIndex = function() {
    var _this = this,
      parent = _this.getParent(),
      list, prevSiblingLengths = 0;

    if (!parent) {
      return -1;
    }

    list = parent.childs();
    list.some(function(sibling) {
      if (sibling === _this) {
        return true;
      }
      prevSiblingLengths += sibling.length();
    });

    return prevSiblingLengths + parent.getIndex() + 1;
  };

  function EpicViewModel(container, item, type) {
    var _this = this;
    if (type !== 'epic') {
      throw new Error('item must be an epic');
    }
    EpicViewModel.super_.call(_this, container, item, type, true);

    // mixinComputeLength(_this, 1);
    _this.length = ko.observable(_this.startLength);
    mixinComputePoints(_this);

    //
    // events
    //
    _this.cmdEdit = ko.command(function(cb) {
      _this.container.editItem('epic', null, _this.item, cb);
    });
    _this.cmdAddEpic = ko.command(function(cb) {
      _this.container.editItem('epic', _this.item.ID, null, cb);
    });
    _this.cmdAddStory = ko.command(function(cb) {
      _this.container.editItem('story', _this.item.ID, null, cb);
    });
  }
  utils.inherits(EpicViewModel, BaseItemViewModel);
  EpicViewModel.prototype.acceptsChild = function(testVm) {
    return (testVm instanceof EpicViewModel) ||
      (testVm instanceof StoryViewModel);
  };
  // EpicViewModel.prototype.onUpdate = function(item) {};

  function StoryViewModel(container, item, type) {
    var _this = this;
    if (type !== 'story') {
      throw new Error('item must be a story');
    }
    StoryViewModel.super_.call(_this, container, item, type, true);

    // mixinComputeLength(_this, 1);
    _this.length = ko.observable(_this.startLength);
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
      _this.container.editItem('story', null, _this.item, cb);
    });
    _this.cmdAddTask = ko.command(function(cb) {
      _this.container.editItem('task', _this.item.ID, null, cb);
    });
  }
  utils.inherits(StoryViewModel, BaseItemViewModel);
  StoryViewModel.prototype.acceptsChild = function( /*testVm*/ ) {
    return false;
  };
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

    // mixinComputeLength(_this, 1);
    _this.length = ko.observable(_this.startLength);
  }
  utils.inherits(StepViewModel, BaseItemViewModel);
  StepViewModel.prototype.canMove = false;
  StepViewModel.prototype.acceptsChild = function(testVm) {
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

    //
    // events
    //
    _this.cmdEdit = ko.command(function(cb) {
      _this.container.editItem('task', null, _this.item, cb);
    });
  }
  utils.inherits(TaskViewModel, BaseItemViewModel);
  // TaskViewModel.prototype.acceptsChild = function(testVm) {
  //   var _this = this;
  //   return (testVm instanceof TaskViewModel) &&
  //     testVm.item.StoryId === _this.item.StoryId;
  // };
  TaskViewModel.prototype.acceptsChild = function( /*testVm*/ ) {
    return false;
  };

  function BacklogData(options) {
    var _this = this;
    // EpicViewModel.super_.call(_this, null, null, 'backlog');
    options = options || {};

    _this.onRowCountChanged = new Slick.Event();
    _this.onRowsChanged = new Slick.Event();

    _this.layersVm = options.layersVm;
    _this.isBacklog = options.isBacklog || false;

    _this._initialized = false;
    _this.sidToVmMap = {};
    _this.startLength = 0;
    _this.length = ko.observable(_this.startLength);
    // mixinComputeLength(_this, 0);
    _this.childs = ko.observableArray();
    _this.depth = ko.observable(0);

    //
    // events
    //
    _this.cmdAddEpic = ko.command(function(cb) {
      _this.editItem('epic', null, null, cb);
    });
    _this.cmdAddStory = ko.command(function(cb) {
      _this.editItem('story', null, null, cb);
    });
  }
  utils.inherits(BacklogData, BaseItemViewModel);
  BacklogData.prototype.acceptsChild = EpicViewModel.prototype.acceptsChild;
  // BacklogData.prototype.removeChild = BaseItemViewModel.prototype.removeChild;
  // BacklogData.prototype.addChild = BaseItemViewModel.prototype.addChild;
  // BacklogData.prototype.updateComputables = BaseItemViewModel.prototype.updateComputables;
  // purposely using updateComputables instead of updateUpComputables
  // since we don't have a parent
  BacklogData.prototype.updateUpComputables = BaseItemViewModel.prototype.updateComputables;

  BacklogData.prototype.updateItem = function(item, type) {
    // ensure items have correct parent ids
    switch (type) {
      case 'task':
        if (!item.TaskStepSid) {
          item.TaskStepSid = item.TaskStepId + '_' + getSidPrefix('story') + item.StoryId;
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

    _this.updateComputables(true);
    childs.forEach(function(child) {
      child.updateDepth(0);
    });
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

  BacklogData.prototype.makeEditor = function(type, parentId, item) {
    var vm, _this = this;
    switch (type) {
      case 'epic':
        vm = new EpicEditorViewModel({
          parentId: parentId,
          item: utils.clone(item),
          epics: _this.getEpics(),
        });
        break;
      case 'story':
        vm = new StoryEditorViewModel({
          epicId: parentId,
          item: utils.clone(item),
          epics: _this.getEpics(),
          sprints: [], //@TODO
        });
        break;
      case 'task':
        vm = new TaskEditorViewModel({
          storyId: parentId,
          item: item,
          taskSteps: _this.taskSteps,
        });
        break;
    }
    return vm;
  };
  BacklogData.prototype.editItem = function(type, parentId, item, cb) {
    var _this = this,
      vm = _this.makeEditor(type, parentId, item);
    _this.layersVm.show(vm, function(result) {
      if (result) {
        //@TODO: use correct update function
        _this.updateItem(result, type);
      }
      cb();
    });
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

  BacklogData.prototype.getLength = function() {
    var _this = this;
    return _this.length();
  };

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
  BacklogData.prototype.getItemMetadata = function(index) {
    var _this = this,
      item, result;
    item = _this.getItem(index);
    if (item.depth() > 0) {
      result = {
        // selectable: true,
        // focusable: false,
        // cssClasses: '',
        columns: [
          {
            id: '#',
          },
          // {
          //   id: '#c',
          // },
          {
            id: "name",
            formatter: function(row, cell, value, columnDef, dataCtx) {
              var i = item.depth(),
                tab = '';
              while (i--) {
                tab += '<span class="cell-tab">&nbsp;</span>';
              }
              return tab + dataCtx.item.Name;
              // return '<span class="parent-cell" style="width:' + (item.depth() * 25) + 'px;">&nbsp;</span>' + dataCtx.item.Name;
            },
          },
          {
            id: "points",
            formatter: function(row, cell, value, columnDef, dataCtx) {
              return dataCtx.points();
            },
          },
        ]
      };
    }
    return result;
  };

  function print(item, indent) {
    if (item.item) {
      console.log(indent, item.sid + ': ' + item.item.Name);
    }
    if (item.childs !== true) {
      item.childs().forEach(function(child) {
        print(child, indent + '  ');
      });
    }
  }
  BacklogData.prototype.print = function() {
    print(this, '');
  };

  return BacklogData;
});
