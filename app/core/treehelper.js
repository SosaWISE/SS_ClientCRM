define("src/core/treehelper", [
  "ko",
  "src/core/utils",
], function(
  ko,
  utils
) {
  "use strict";

  function walkTree_Helper(item, listName, fn, parent) {
    if (!item) {
      return;
    }
    var list = item[listName];
    if (!list) {
      return;
    }
    list = ko.unwrap(list);
    list.forEach(function(item) {
      var stop = fn(item, parent);
      if (!stop) {
        walkTree_Helper(item, listName, fn, item);
      }
    });
  }

  function walkTree(item, propName, fn) {
    walkTree_Helper(item, propName, fn, null);
  }

  function makeTree(list, idKey, parentIdKey, mapFn) {
    var treeTrunk,
      tempParents = [],
      tempChildsMap = {},
      toVisitMap = {};
    if (!utils.isFunc(mapFn)) {
      treeTrunk = [];
      mapFn = null;
    }

    // prep before recursion
    list.forEach(function(item) {
      var parentId = item[parentIdKey],
        id = item[idKey],
        tempChilds;
      if (!id) {
        console.log("item has no id:", item);
        return;
      }

      if (!mapFn) {
        // set childs when there"s not a mapping function
        item.childs = [];
      }

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
        console.log("already visited:", id);
        return;
      }
      delete toVisitMap[id];

      if (!mapFn) {
        mappedItem = item;
      } else {
        // map item
        mappedItem = mapFn(item, mappedParent, parent);
      }
      // try to map temp childs
      tempChilds = tempChildsMap[id];
      if (tempChilds) {
        //@NOTE: item is now the parent
        tempChilds.forEach(function(child) {
          // recursion happens here
          buildBranch(child, item.childs, mappedItem, item);
        });
      }

      if (!mapFn && childList) {
        childList.push(mappedItem);
      }
    }

    // start recursion
    tempParents.forEach(function(item) {
      buildBranch(item, treeTrunk, null, null);
    });

    // show which items are not connected to the tree trunk
    Object.keys(toVisitMap).forEach(function(id) {
      console.log("disconnected id:", id);
    });

    return treeTrunk;
  }

  return {
    walkTree: walkTree,
    makeTree: makeTree,
  };
});
