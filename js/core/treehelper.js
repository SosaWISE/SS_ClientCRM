define('src/core/treehelper', [
], function() {
  'use strict';

  function walkTree_Helper(list, fn, parent) {
    if (!list) {
      return;
    }

    list.forEach(function(item) {
      fn(item, parent);
      walkTree_Helper(item.childs, fn, item);
    });
  }

  function walkTree(list, fn) {
    walkTree_Helper(list, fn, null);
  }

  function passThrough(item /*, mappedParent, parent*/ ) {
    return item;
  }

  function makeTree(list, idKey, parentIdKey, includeParentProp, mapFn) {
    var treeTrunk = [],
      tempParents = [],
      tempChildsMap = {},
      toVisitMap = {};
    if (typeof(mapFn) !== 'function') {
      mapFn = passThrough;
    }

    // prep before recursion
    list.forEach(function(item) {
      var parentId = item[parentIdKey],
        id = item[idKey],
        tempChilds;

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
        // treeTrunk.push(mapFn(item, null));
      }

      // map id to true(needs to be visited)
      toVisitMap[id] = true;
    });


    function walk(item, mappedParent, parent) {
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
        //@NOTE: item is now the parent
        tempChilds.forEach(function(child) {
          child = walk(child, mappedItem, item);
          if (child) {
            item.childs.push(child);
          }
        });
      }
      // return mapped item
      return mappedItem;
    }
    tempParents.forEach(function(item) {
      item = walk(item, null, null);
      if (item) {
        treeTrunk.push(item);
      }
    });

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
