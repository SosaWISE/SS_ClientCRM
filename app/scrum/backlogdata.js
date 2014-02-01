define('src/scrum/backlogdata', [
  'src/core/treehelper',
  'src/core/notify',
  'ko',
], function(
  treehelper,
  notify,
  ko
) {
  "use strict";

  function makeId(item) {
    if (isStory(item)) {
      return 'US' + item.ID;
    } else {
      return 'E' + item.ID;
    }
  }

  function makeParentId(parentId) {
    return parentId ? ('E' + parentId) : null;
  }

  function makeVm(bd, item) {
    if (isStory(item)) {
      return new StoryViewModel(bd, item);
    } else {
      return new EpicViewModel(bd, item);
    }
  }

  function isStory(item) {
    return item.hasOwnProperty('Points');
  }

  function sorter(a, b) {
    return b.sortOrder - a.sortOrder;
  }


  // function BacklogItem() {
  // }


  function EpicViewModel(bd, item) {
    var _this = this;

    if (isStory(item)) {
      throw new Error('item must be an epic');
    }

    _this.bd = bd;
    _this.parentId = makeParentId(item.ParentId);
    _this.id = makeId(item);
    _this.name = item.Name;
    _this.version = item.Version || 0;
    _this.sortOrder = item.SortOrder || 0;

    _this.points = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.points();
        }, 0);
      },
    });
    _this.length = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.length();
        }, 1);
      },
    });
    _this.childs = ko.observableArray();
  }
  EpicViewModel.prototype.viewTmpl = 'tmpl-scrum_epic';
  EpicViewModel.prototype.update = function(item) {
    if (isStory(item)) {
      throw new Error('item must be an epic');
    }
    var _this = this,
      id = makeId(item),
      parent;
    if (_this.id && _this.id !== id) {
      throw new Error('mismatching id\'s');
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
    _this.parentId = makeParentId(item.ParentId);
    _this.name = item.Name;
    _this.version = item.Version || 0;
    _this.sortOrder = item.SortOrder || 0;

    // add to parent as child in correct order
    parent = _this.getParent();
    if (parent) {
      parent.addChild(_this);
      return true;
    } else {
      return false;
    }
  };
  EpicViewModel.prototype.getParent = function() {
    var _this = this,
      parentId = _this.parentId,
      bd = _this.bd;
    if (parentId) {
      return bd.idToVmMap[parentId];
    } else {
      return bd;
    }
  };
  EpicViewModel.prototype.removeChild = function(vm) {
    var _this = this;
    return !!_this.childs.remove(vm).length;
  };
  EpicViewModel.prototype.addChild = function(vm) {
    var _this = this;
    insert(_this.childs, vm, sorter);
  };

  function StoryViewModel(bd, item) {
    var _this = this;

    if (!isStory(item)) {
      throw new Error('item must be a story');
    }

    _this.bd = bd;
    _this.parentId = makeParentId(item.EpicId);
    _this.id = makeId(item);
    _this.name = item.Name;
    _this.version = item.Version;
    _this.sortOrder = item.SortOrder || 0;

    _this.points = ko.observable(item.Points);
    _this.length = function() {
      return 1;
    };
  }
  StoryViewModel.prototype.childs = true; // hack to stop treehelper from creating a childs array
  StoryViewModel.prototype.viewTmpl = 'tmpl-scrum_story';
  StoryViewModel.prototype.update = function(item) {
    if (!isStory(item)) {
      throw new Error('item must be a story');
    }
    var _this = this,
      id = makeId(item);
    if (_this.id && _this.id !== id) {
      throw new Error('mismatching id\'s');
    }

    if (_this.version && _this.version > item.Version) {
      console.log('current version is greater than new Version');
      return false;
    }

    // remove from parent
    _this.getParent().removeChild(_this);

    // update data
    _this.parentId = makeParentId(item.EpicId);
    _this.name = item.Name;
    _this.version = item.Version || 0;
    _this.sortOrder = item.SortOrder || 0;

    _this.points(item.Points);

    // add to parent as child in correct order
    _this.getParent().addChild(_this);

    return true;
  };
  StoryViewModel.prototype.getParent = function() {
    var _this = this;
    return _this.bd.idToVmMap[_this.parentId];
  };
  StoryViewModel.prototype.removeChild = function() {
    throw new Error('not supported');
  };
  StoryViewModel.prototype.addChild = function() {
    throw new Error('not supported');
  };


  function BacklogData(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }

    _this._initialized = false;
    _this.idToVmMap = {};
    _this.length = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.childs().reduce(function(current, value) {
          return current + value.length();
        }, 0);
      },
    });
    _this.childs = ko.observableArray();

    _this.columns = [
      {
        id: "name",
        name: "Name",
        field: "name",
        // width: 70,
        // minWidth: 50,
        cssClass: "cell-name",
        // sortable: true,
        // editor: Slick.Editors.Text
      },
      {
        id: "points",
        name: "Points",
        field: "points",
        width: 70,
        minWidth: 50,
        cssClass: "cell-points",
        // sortable: true,
        // editor: Slick.Editors.Text
      },
    ];
  }
  BacklogData.prototype.removeChild = function(vm) {
    var _this = this;
    return !!_this.childs.remove(vm).length;
  };
  BacklogData.prototype.addChild = function(vm) {
    var _this = this;
    insert(_this.childs, vm, sorter);
  };

  BacklogData.prototype.updateItem = function(item) {
    var _this = this,
      idToVmMap = _this.idToVmMap,
      vm = makeVm(_this, item),
      currVm = idToVmMap[vm.id],
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
        idToVmMap[vm.id] = vm;
      }
    } else if (!currVm || currVm.version <= vm.version) {
      // just add to map since it's not yet initialized
      idToVmMap[vm.id] = vm;
      added = true;
    }
    return added;
  };
  BacklogData.prototype.removeItem = function(item) {
    if (!isStory(item)) {
      throw new Error('only storys can be removed');
    }

    var _this = this,
      idToVmMap = _this.idToVmMap,
      id = makeId(item),
      currVm = idToVmMap[id];

    if (!currVm) {
      return false;
    }

    delete idToVmMap[id];
    return currVm.getParent().removeChild(currVm);
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
  BacklogData.prototype.getLength = function() {
    var _this = this;
    return _this.length();
  };
  BacklogData.prototype.getItem = function(index) {
    var _this = this;
    if (index < 0 || _this.length() <= index) {
      throw new Error('index outside of bounds');
    }
    return findItemAtIndex(_this, {
      index: index + 1
    });
  };
  BacklogData.prototype.getItemMetadata = function( /*index*/ ) {
    var _this = this;
    return _this.columns;
  };



  BacklogData.prototype.init = function(epics, storys) {
    var _this = this,
      idToVmMap = _this.idToVmMap,
      childs, list, detachedList = [];

    if (_this._initialized) {
      throw new Error('already initialized');
    }
    _this._initialized = true;

    // add epics and storys to map
    function setList(list) {
      list.forEach(function(item) {
        var vm = makeVm(_this, item),
          currVm = idToVmMap[vm.id];
        // There's a small chance that the item could have been updated in the time it takes
        // to get all thebacklog items, so we're just making sure we have the latest version.
        if (!currVm || currVm.version <= vm.version) {
          idToVmMap[vm.id] = vm;
        }
      });
    }
    setList(epics);
    setList(storys);

    // turn map back into a list
    list = Object.keys(idToVmMap).map(function(key) {
      return idToVmMap[key];
    });

    // sort epics and storys
    list.sort(sorter);
    // wrap them and create tree
    childs = treehelper.makeTree(list, 'id', 'parentId', function(item, parent) {
      // set parent (use backlog as parent if it's null)
      item.parent = parent || _this;
      return item;
    }, null, null, detachedList);
    detachedList.forEach(function(item) {
      insert(childs, item, sorter);
    });

    _this.childs(childs);
  };

  function insert(list, item, sorter) {
    // list.push(item);
    // return;

    if (!list().some(function(b, index) {
      if (sorter(item, b) > 0) {
        // insert item
        list.splice(index, 0, item);
        return true;
      }
    })) {
      // add to end
      list.push(item);
    }
  }

  // function createEpicHolder(item, idMap) {
  //   var result = {
  //     item: item,
  //     id: item.ID,
  //     childs: ko.observable(item.childs),
  //     points: ko.computed({
  //       deferEvaluation: true,
  //       read: function() {
  //         return this.childs().reduce(function(current, value) {
  //           return current + value.points();
  //         }, 0);
  //       },
  //     }),
  //   };
  //
  //   Object.defineProperty(result, "item", {
  //     get: function() {
  //       return idMap[item.ID];
  //     },
  //     // set: function(val) { },
  //   });
  //
  //   // // overwrite `childs` set in treehelper
  //   // item.childs = result.childs;
  //
  //   return result;
  // }
  //
  // function createStoryHolder(item, idMap) {
  //   var result = {
  //     // item: item,
  //     points: ko.observable(item.Points),
  //   };
  //
  //   Object.defineProperty(result, "item", {
  //     get: function() {
  //       return idMap[item.ID];
  //     },
  //     // set: function(val) { },
  //   });
  //
  //   return result;
  // }

  return BacklogData;
});
