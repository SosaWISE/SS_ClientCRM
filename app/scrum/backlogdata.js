define('src/scrum/backlogdata', [
  'slick',
  'src/core/treehelper',
  'src/core/notify',
  'ko',
], function(
  Slick,
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

  function makeVm(item) {
    if (isStory(item)) {
      return new StoryViewModel();
    } else {
      return new EpicViewModel();
    }
  }

  function isStory(item) {
    return item.hasOwnProperty('Points');
  }

  function sorter(a, b) {
    return b.sortOrder - a.sortOrder;
  }



  function EpicViewModel() {
    var _this = this;

    _this.parentId = null;
    _this.id = null;
    _this.name = null;

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
    var _this = this,
      isEpic = !isStory(item),
      id = makeId(item),
      parentId = item.ParentId;

    if (_this.id && _this.id !== id) {
      console.warn('mismatching id\'s');
      return;
    }
    if (!isEpic) {
      console.warn('item cannot be a story');
      return;
    }
    if (_this.version && _this.version > item.Version) {
      console.warn('current version is greater than new Version');
      return;
    }

    _this.parentId = parentId ? ('E' + parentId) : null;
    _this.id = id;
    _this.name = item.Name;
    // _this.sortOrder = item.SortOrder;
  };

  function StoryViewModel() {
    var _this = this;

    _this.parentId = null;
    _this.id = null;
    _this.name = null;
    _this.version = null;

    _this.points = ko.observable(0);
    _this.length = function() {
      return 1;
    };
  }
  StoryViewModel.prototype.viewTmpl = 'tmpl-scrum_story';
  StoryViewModel.prototype.update = function(item) {
    var _this = this,
      isEpic = !isStory(item),
      id = makeId(item),
      parentId = item.EpicId;

    if (_this.id && _this.id !== id) {
      console.warn('mismatching id\'s');
      return;
    }
    if (isEpic) {
      console.warn('item must be a story');
      return;
    }
    if (_this.version && _this.version > item.Version) {
      console.warn('current version is greater than new Version');
      return;
    }

    _this.parentId = parentId ? ('E' + parentId) : null;
    _this.id = id;
    _this.name = item.Name;
    _this.version = item.Version;
    // _this.sortOrder = item.SortOrder;
    _this.points(item.Points);
  };


  function BacklogData(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }

    _this._init = false;
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

    _this.onRowCountChanged = new Slick.Event();
    _this.onRowsChanged = new Slick.Event();
  }

  BacklogData.prototype.update = function(item) {
    var _this = this,
      id = makeId(item),
      idToVmMap = _this.idToVmMap,
      vm;

    vm = idToVmMap[id];
    if (!vm) {
      idToVmMap[id] = vm = makeVm(item);
    }
    vm.update(item);
    //@TODO:
    //  invalidate row
    //  move to new parent

    if (_this._init) {

    }
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
      childs, list, detachedList = [],
      countBefore, diff;

    if (_this._init) {
      console.warn('already initialized');
      return;
    }
    _this._init = true;

    // add epics and storys to map
    function updateList(list) {
      list.forEach(function(item) {
        _this.update(item);
      });
    }
    updateList(epics);
    updateList(storys);

    // turn map back into a list
    list = Object.keys(idToVmMap).map(function(key) {
      return idToVmMap[key];
    });

    // sort epics and storys
    list.sort(sorter);
    // wrap them and create tree
    childs = treehelper.makeTree(list, 'id', 'parentId', null, null, null, detachedList);
    detachedList.forEach(function(item) {
      insert(childs, item, sorter);
    });

    _this.childs(childs);


    countBefore = 0;
    diff = [];
    list.some(function(item, index) {
      diff.push(index);
      // return true;
    });
    if (countBefore !== _this.length()) {
      _this.onRowCountChanged.notify({
        previous: countBefore,
        current: _this.length(),
      }, null, _this);
    }
    if (diff.length > 0) {
      _this.onRowsChanged.notify({
        rows: diff,
      }, null, _this);
    }
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
