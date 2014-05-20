define('src/core/treehelper', [
  'ko',
  'src/core/utils',
], function(
  ko,
  utils
) {
  'use strict';

  function walkTree_Helper(list, fn, parent) {
    if (!list) {
      return;
    }
    list = ko.unwrap(list);
    list.forEach(function(item) {
      var stop = fn(item, parent);
      if (!stop) {
        walkTree_Helper(item.childs, fn, item);
      }
    });
  }

  function walkTree(list, fn) {
    walkTree_Helper(list, fn, null);
  }

  function passThrough(item /*, mappedParent, parent*/ ) {
    return item;
  }

  function makeTree(list, idKey, parentIdKey, mapFn, sortFn, postSort) {
    var treeTrunk = [],
      tempParents = [],
      tempChildsMap = {},
      toVisitMap = {},
      preSort;
    if (!utils.isFunc(mapFn)) {
      mapFn = passThrough;
    }
    if (utils.isFunc(sortFn)) {
      preSort = !postSort;
    } else {
      preSort = postSort = false;
    }

    // prep before recursion
    list.forEach(function(item) {
      var parentId = item[parentIdKey],
        id = item[idKey],
        tempChilds;
      if (!id) {
        console.log('item has no id:', item);
        return;
      }

      // set childs
      item.childs = [];

      if (parentId) {
        // map parentId to temp childs list
        tempChilds = tempChildsMap[parentId];
        if (!tempChilds) {
          tempChildsMap[parentId] = tempChilds = [];
        }
        tempChilds.push(item);
      } else {
        // add to temp parent list
        tempParents.push(item);
      }

      // map id to true(needs to be visited)
      toVisitMap[id] = true;
    });


    function buildBranch(item, childList, mappedParent, parent) {
      var id = item[idKey],
        mappedItem, tempChilds;
      if (!toVisitMap[id]) {
        console.log('already visited:', id);
        return;
      }
      delete toVisitMap[id];

      // map item
      mappedItem = mapFn(item, mappedParent, parent);
      // try to map temp childs
      tempChilds = tempChildsMap[id];
      if (tempChilds) {
        // pre-sort childs
        if (preSort) {
          tempChilds.sort(sortFn);
        }
        //@NOTE: item is now the parent
        tempChilds.forEach(function(child) {
          // recursion happens here
          buildBranch(child, item.childs, mappedItem, item);
        });
        // post-sort childs
        if (postSort) {
          item.childs.sort(sortFn);
        }
      }

      // add item to child list
      childList.push(mappedItem);
    }

    // start recursion
    // pre-sort parents
    if (preSort) {
      tempParents.sort(sortFn);
    }
    tempParents.forEach(function(item) {
      buildBranch(item, treeTrunk, null, null);
      // post-sort parents
      if (postSort) {
        treeTrunk.sort(sortFn);
      }
    });

    // show which items aren't connected to the tree trunk
    Object.keys(toVisitMap).forEach(function(id) {
      console.log('disconnected id:', id);
    });

    return treeTrunk;
  }

  return {
    walkTree: walkTree,
    makeTree: makeTree,
  };
});
