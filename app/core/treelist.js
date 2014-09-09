﻿define('src/core/treelist', [
  'ko',
  'src/core/strings',
  'src/core/utils',
], function(
  ko,
  strings,
  utils
) {
  "use strict";

  //
  //
  // Node
  //
  //
  function Node() {
    var _this = this;

    _this.childs = ko.observableArray([]);
    // _this.folded = ko.observable(false); //@NOTE: folding not supported yet
  }
  Node.prototype.data = null;
  Node.prototype.next = null; // next node
  Node.prototype.prev = null; // parent node or previous node
  Node.prototype.down = null; // first child node
  Node.prototype.length = 0; //1;

  //
  //
  // TreeList
  //
  //
  function TreeList(comparer) {
    if (!comparer) {
      throw new Error('no comparer');
    }
    var _this = this;
    TreeList.super_.call(_this);
    _this.data = {
      // sid: null,
      psid: null,
    };

    _this.map = {};
    _this.comparer = comparer;
  }
  utils.inherits(TreeList, Node);

  TreeList.prototype.toText = function() {
    var _this = this,
      buffer = [];
    walkDown(_this, function(node, index, parent, depth) {
      buffer.push(strings.repeat('  ', depth) + node.data.sid);
      return true;
    });
    return buffer.join('\n');
  };
  TreeList.prototype.validate = function() {
    var _this = this,
      errs = [];
    walkDown(_this, function(node, index, parent /*, depth*/ ) {
      var childs = parent.childs.peek(),
        length, childCount = 0;
      // match parent childs
      if (childs[index] !== node) {
        errs.push(strings.format('Node mismatch: {0}, {1}', childs[index].data.sid, node.data.sid));
      }
      // match parent childs
      length = node.childs.peek().length;
      node = node.down;
      while (node) {
        childCount++;
        node = node.next;
      }
      if (childCount !== length) {
        errs.push(strings.format('Child length mismatch: {0}, {1}', childCount, length));
      }
      return true;
    });
    return errs;
  };

  TreeList.prototype.has = function(data) {
    if (!data.sid) {
      throw new Error('no sid');
    }
    var _this = this,
      // lookup by sid
      node = _this.map[data.sid];
    return !!node;
  };
  TreeList.prototype.remove = function(data) {
    if (!data.sid) {
      throw new Error('no sid');
    }
    var _this = this,
      // lookup by sid
      node = _this.map[data.sid];
    if (node) {
      //@TODO: compare versions
      // if (data.version <= node.data.version) {
      //   return; // attempted to update with lower version
      // }

      // update (remove, then re-add)
      removeNode(_this, node);
      delete _this.map[data.sid];
      return true;
    }
    return false;
  };
  TreeList.prototype.update = function(data) {
    if (!data.sid) {
      throw new Error('no sid');
    }
    var _this = this,
      // lookup by sid
      node = _this.map[data.sid];
    if (node) {
      //@TODO: compare versions
      // if (data.version <= node.data.version) {
      //   return; // attempted to update with lower version
      // }

      // update (remove, then re-add)
      removeNode(_this, node);
    } else {
      // create and add to map
      _this.map[data.sid] = node = new Node();
    }
    // add node
    node.data = data;
    addNode(_this, node);
  };


  TreeList.prototype.getLength = function() {
    var _this = this;
    return _this.length;
  };
  TreeList.prototype.getItemMetadata = function() {
    return null;
    // TreeList.prototype.getItemMetadata = function(index) {
    //   var _this = this,
    //     item, result;
    //   item = _this.getItem(index);
    //   if (item.depth() > 0) {
    //     result = {
    //       // selectable: true,
    //       // focusable: false,
    //       // cssClasses: '',
    //       columns: [ //
    //         {
    //           id: '#',
    //         },
    //         // {
    //         //   id: '#c',
    //         // },
    //         {
    //           id: "name",
    //           formatter: function(row, cell, value, columnDef, dataCtx) {
    //             var i = item.depth(),
    //               tab = '';
    //             while (i--) {
    //               tab += '<span class="cell-tab">&nbsp;</span>';
    //             }
    //             return tab + dataCtx.item.Name;
    //             // return '<span class="parent-cell" style="width:' + (item.depth() * 25) + 'px;">&nbsp;</span>' + dataCtx.item.Name;
    //           },
    //         }, {
    //           id: "points",
    //           formatter: function(row, cell, value, columnDef, dataCtx) {
    //             return dataCtx.points();
    //           },
    //         },
    //       ]
    //     };
    //   }
    //   return result;
  };
  TreeList.prototype.getItem = function(index) {
    var _this = this,
      result, length;
    if (index < 0 || _this.length <= index) {
      throw new Error('index outside of bounds');
    }
    walkDown(_this, function(node /*, index, parent, depth*/ ) {
      if (index === 0) {
        // found it
        result = node.data;
        return; // step out
      }

      length = node.length + 1;
      if (index <= length) {
        index--;
        return true; // step in
      } else {
        index -= length;
        return false; // step over
      }
    });
    return result;
  };

  function getParent(tree, node) {
    if (tree === node) {
      return null;
    }
    return (node.data.psid) ? tree.map[node.data.psid] : tree;
  }

  function addNode(tree, node) {
    var parent = getParent(tree, node),
      comparer = tree.comparer,
      index = 0,
      prevNode, nextNode;
    if (!parent) {
      throw new Error('no parent');
    }

    // walk to find position
    prevNode = parent;
    nextNode = parent.down;
    while (nextNode) {
      if (comparer(node.data, nextNode.data) < 0) {
        // found position
        break;
      }
      // step
      prevNode = nextNode;
      nextNode = nextNode.next;
      index++;
    }

    if (prevNode === parent) {
      node.prev = parent;
      parent.down = node;
    } else {
      node.prev = prevNode;
      prevNode.next = node;
    }

    if (nextNode) {
      nextNode.prev = node;
    }
    node.next = nextNode;

    // increment lengths
    // parent.length++;
    updateLengths(tree, parent, node.length + 1);

    // insert into array
    parent.childs.splice(index, 0, node);
  }

  function removeNode(tree, node) {
    var parent = getParent(tree, node),
      index = 0,
      prevNode = node.prev,
      nextNode = node.next;
    if (!parent) {
      throw new Error('no parent');
    }

    if (prevNode) {
      if (prevNode === parent) {
        // prev node is the parent
        parent.down = nextNode;
      } else {
        // prev node is a sibling
        prevNode.next = nextNode;
        // find correct index
        index = parent.childs.peek().indexOf(node);
      }
    }
    if (nextNode) {
      nextNode.prev = prevNode;
    }
    //
    node.prev = null;
    node.next = null;

    // decrement lengths
    // parent.length--;
    updateLengths(tree, parent, (node.length + 1) * -1);

    // remove from array
    parent.childs.splice(index, 1);
  }

  function updateLengths(tree, node, amount) {
    // // change length of parents
    // // walk up tree
    // var prevNode = node.prev;
    // while (prevNode) {
    //   // test if prevNode is a parent node
    //   if (node === prevNode.down) {
    //     prevNode.length += amount;
    //   }
    //   node = prevNode;
    //   prevNode = prevNode.prev;
    // }

    while (node) {
      node.length += amount;
      // get parent
      node = getParent(tree, node);
    }
  }

  function walkDown(tree, func) {
    (function step(parent, node, depth) {
      var index = 0,
        stepIn;
      while (node) {
        stepIn = func(node, index, parent, depth);
        if (typeof(stepIn) !== 'boolean') {
          return; // if stepIn is not a boolean step out
        }

        if (stepIn) {
          // walk childs
          stepIn = step(node, node.down, depth + 1);
          if (typeof(stepIn) !== 'boolean') {
            return; // if stepIn is not a boolean step out
          }

          // move next
          node = node.next;
          index++;
        } else { // step over childs
          // add length of child
          index += node.length + 1;
          // move next
          node = node.next;
        }
      }
      // keep going
      return true;
    })(tree, tree.down, 0);
  }

  //
  return TreeList;
});