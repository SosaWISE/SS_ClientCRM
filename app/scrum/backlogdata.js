define('src/scrum/backlogdata', [
  'src/core/relativesort',
  'src/core/treehelper',
  'src/core/notify',
  'ko',
  'src/core/utils',
], function(
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

  function makeItemSid(item, type) {
    var prefix;
    switch (type) {
      case 'epic':
        prefix = 'E';
        break;
      case 'story':
        prefix = 'US';
        break;
      case 'task':
        prefix = 'T';
        break;
      default:
        throw new Error('unsupported type: ' + type);
    }
    return prefix + item.ID;
  }

  function BaseItemViewModel(container, item, type, level) {
    var _this = this;
    _this.container = container;
    _this.item = item;
    _this.type = type;
    _this.level = level;
    _this.viewTmpl = 'tmpl-scrum_' + type;
    _this.sid = makeItemSid(item, type);
    _this.parentSid = _this.makeParentSid();
    _this.version = item.Version || 0;
    _this.sortOrder = item.SortOrder || 0;
    _this.length = returnOne;
  }
  BaseItemViewModel.prototype.childs = true; // hack to stop treehelper from creating a childs array
  BaseItemViewModel.prototype.makeParentSid = function() {
    var _this = this,
      item = _this.item,
      parentId, prefix;
    switch (_this.type) {
      case 'epic':
        parentId = item.ParentId;
        prefix = 'E';
        break;
      case 'story':
        if (_this.level !== 0) {
          parentId = item.EpicId;
          prefix = 'E';
        }
        break;
      case 'task':
        parentId = item.StoryId;
        prefix = 'US';
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

  function EpicViewModel(container, item, type, level) {
    var _this = this;
    if (type !== 'epic') {
      throw new Error('item must be an epic');
    }
    EpicViewModel.super_.call(_this, container, item, type, level);

    _this.length = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.length();
        }, 1);
      },
    });

    _this.points = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.points();
        }, 0);
      },
    });
    _this.childs = ko.observableArray();
  }
  utils.inherits(EpicViewModel, BaseItemViewModel);
  // EpicViewModel.prototype.onUpdate = function(item) {};

  function StoryViewModel(container, item, type, level) {
    var _this = this;
    if (type !== 'story') {
      throw new Error('item must be a story');
    }
    StoryViewModel.super_.call(_this, container, item, type, level);

    _this.points = ko.observable(item.Points);
  }
  utils.inherits(StoryViewModel, BaseItemViewModel);
  StoryViewModel.prototype.onUpdate = function(item) {
    var _this = this;
    _this.points(item.Points);
  };

  function BacklogData() {
    var _this = this;
    // EpicViewModel.super_.call(_this, null, null, 'backlog');

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
    return currVm.getParent().removeChild(currVm);
  };

  BacklogData.prototype.makeVm = function(item, type) {
    var _this = this,
      level = _this.typeToLevelMap[type],
      Ctor;
    switch (type) {
      case 'epic':
        Ctor = EpicViewModel;
        break;
      case 'story':
        Ctor = StoryViewModel;
        break;
      case 'task':
        // Ctor = TaskViewModel;
        break;
      default:
        throw new Error('unsupported type: ' + type);
    }
    return new Ctor(_this, item, type, level);
  };
  BacklogData.prototype.init = function(typeLevels) {
    var _this = this,
      sidToVmMap = _this.sidToVmMap,
      childs, list, orphans = [];

    if (_this._initialized) {
      throw new Error('already initialized');
    }
    _this._initialized = true;

    _this.typeToLevelMap = {};
    typeLevels.forEach(function(obj, level) {
      _this.typeToLevelMap[obj.type] = level;
    });

    // add epics, storys, and tasks to map
    typeLevels.forEach(function(obj) {
      obj.list.forEach(function(item) {
        var vm = _this.makeVm(item, obj.type),
          currVm = sidToVmMap[vm.sid];
        // There's a small chance that the item could have been updated in the time it takes
        // to get all the items, so we're just making sure we have the latest version.
        if (!currVm || currVm.version <= vm.version) {
          sidToVmMap[vm.sid] = vm;
        }
      });
    });

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
