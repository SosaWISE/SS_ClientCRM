define('src/core/linkedlist', [
  'src/core/utils',
], function(
  utils
) {
  "use strict";

  function LinkedList(value) {
    var _this = this;

    _this.append(value);
  }
  LinkedList.prototype.length = 0;
  LinkedList.prototype._head = null;
  LinkedList.prototype._tail = null;

  LinkedList.prototype.head = function() {
    return this._head;
  };
  LinkedList.prototype.tail = function() {
    return this._tail;
  };
  LinkedList.prototype.append = function(value) {
    if (!value) {
      return;
    }

    var _this = this,
      node;
    if (Array.isArray(value)) {
      value.forEach(function(i) {
        _this.append(i);
      });
      return;
    }

    node = new Node(value);
    if (_this._tail) {
      // link node to end
      _this._tail.next = node;
      node.prev = _this._tail;

      // move tail to last node
      _this._tail = node;
    } else {
      // first node in list
      _this._head = _this._tail = node;
    }

    // increment length
    _this.length++;

    return node;
  };
  LinkedList.prototype.remove = function(value) {
    // find node, remove by fixing prev.next and next.prev
    var _this = this,
      node = _this.findFirstNode(value),
      prev, next;
    if (node) {
      prev = node.prev;
      next = node.next;

      if (prev && next) {
        prev.next = next;
        next.prev = prev;
      } else if (next && node === _this._head) {
        // head node. prev becomes new head.
        next.prev = null;
        _this._head = next;
      } else if (prev && node === _this._tail) {
        // tail node. next becomes new tail.
        prev.next = null;
        _this._tail = prev;
      } else if (node === _this._head && node === _this._tail) {
        // only node. should be head and tail.
        _this._head = _this._tail = null;
      } else {
        throw "invalid state";
      }

      // remove node's pointers
      node.prev = null;
      node.next = null;

      // decrement length
      _this.length--;

      return true;
    }
    return false;
  };
  LinkedList.prototype.findFirstNode = function(value, scope) {
    var _this = this;
    return findNode(_this._head, 'next', createCompareValueFunc(value), scope);
  };
  LinkedList.prototype.findLastNode = function(value, scope) {
    var _this = this;
    return findNode(_this._tail, 'prev', createCompareValueFunc(value), scope);
  };

  //
  //
  // Node
  //
  //
  function Node(value) {
    var _this = this;
    Node.super_.call(_this, null);

    _this.value = value;
  }
  utils.inherits(Node, LinkedList);
  Node.prototype.next = null;
  Node.prototype.prev = null;


  //
  //
  // helper functions
  //
  //
  function createCompareValueFunc(value) {
    if (utils.isFunc(value)) {
      return value;
    }
    return function(node) {
      return (node.value === value);
    };
  }

  function findNode(startNode, walkProp, testFunc, scope) {
    var result,
      node = startNode;
    while (node) {
      if (testFunc.call(scope, node)) {
        result = node;
        // break on truthy result
        break;
      }
      node = node[walkProp];
    }
    return result;
  }

  //
  return LinkedList;
});
