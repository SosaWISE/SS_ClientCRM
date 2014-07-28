/* global describe,it,expect,beforeEach */
define('src/core/treehelper.spec', [
  'src/core/treehelper',
], function(treehelper) {
  "use strict";

  describe('treehelper', function() {
    var testTree = [ //
      {
        id: 1,
        parentId: null,
        name: '1.',
        childs: [ //
          {
            id: 2,
            parentId: 1,
            name: '1.1.',
            childs: [ //
              {
                id: 3,
                parentId: 2,
                name: '1.1.1.',
                childs: [],
              }, {
                id: 4,
                parentId: 2,
                name: '1.1.2.',
                childs: [],
              },
            ],
          }, {
            id: 5,
            parentId: 1,
            name: '1.2.',
            childs: [ //
              {
                id: 6,
                parentId: 5,
                name: '1.2.1.',
                childs: [],
              },
            ],
          },
        ],
      }, {
        id: 7,
        parentId: null,
        name: '2.',
        childs: [],
      },
    ];

    it('should have a `walkTree` function', function() {
      expect(typeof treehelper.walkTree).toBe('function');
    });
    it('should have a `makeTree` function', function() {
      expect(typeof treehelper.makeTree).toBe('function');
    });

    describe('walkTree', function() {

      it('should recursively walk items', function() {
        var expectedIds;
        expectedIds = [1, 2, 3, 4, 5, 6, 7];
        treehelper.walkTree({
          childs: testTree
        }, 'childs', function(item, parent) {
          // removes first item
          var id = expectedIds.shift();
          if (id === 1 || id === 7) {
            expect(parent).toBeNull();
          } else {
            expect(parent).toBeDefined();
          }
          expect(item.id).toBe(id);
        });
        expect(expectedIds.length).toBe(0);
      });
    });

    describe('makeTree w/ no mapping function', function() {
      var list;
      beforeEach(function() {
        list = [ //
          {
            id: 1,
            parentId: null,
            name: '1.',
          }, {
            id: 2,
            parentId: 1,
            name: '1.1.',
          }, {
            id: 3,
            parentId: 2,
            name: '1.1.1.',
          }, {
            id: 4,
            parentId: 2,
            name: '1.1.2.',
          }, {
            id: 5,
            parentId: 1,
            name: '1.2.',
          }, {
            id: 6,
            parentId: 5,
            name: '1.2.1.',
          }, {
            id: 7,
            parentId: null,
            name: '2.',
          },
        ];
      });

      it('should return an array', function() {
        var result = treehelper.makeTree(list, 'id', 'parentId');
        expect(Array.isArray(result)).toBe(true);
      });
      it('should add `childs` property to each item', function() {
        treehelper.makeTree(list, 'id', 'parentId');
        list.forEach(function(item) {
          expect(item.childs).toBeDefined();
        });
      });
      it('should recursively nest items', function() {
        var topLevelList = treehelper.makeTree(list, 'id', 'parentId');
        expect(topLevelList).toEqual(testTree);
      });
    });

    describe('makeTree w/ mapping function', function() {
      var list;
      beforeEach(function() {
        list = [ //
          {
            id: 1,
            parentId: null,
            name: '1.',
          }, {
            id: 2,
            parentId: 1,
            name: '1.1.',
          },
        ];
      });

      it('should return undefined', function() {
        var result = treehelper.makeTree(list, 'id', 'parentId', function mapFn(item /*, mappedParent, parent*/ ) {
          return item;
        });
        expect(result).toBeUndefined();
      });
      it('should not add `childs` property to each item', function() {
        treehelper.makeTree(list, 'id', 'parentId', function mapFn(item /*, mappedParent, parent*/ ) {
          return item;
        });
        list.forEach(function(item) {
          expect(item.childs).toBeUndefined();
        });
      });
      it('should call mapping function', function() {
        var expectedList, wrappedList = [];
        expectedList = [ //
          {
            item: {
              id: 1,
              parentId: null,
              name: '1.',
            },
          }, {
            item: {
              id: 2,
              parentId: 1,
              name: '1.1.',
            },
          },
        ];
        treehelper.makeTree(list, 'id', 'parentId', function mapFn(item /*, mappedParent, parent*/ ) {
          // wrap item
          var mappedItem = {
            item: item,
          };
          wrappedList.push(mappedItem);
          // return wrapped item
          return mappedItem;
        });
        expect(wrappedList).toEqual(expectedList);
      });
      it('should call mapping function with mappedParent', function() {
        var tree, topLevelList = [];
        tree = [ //
          {
            item: {
              id: 1,
              parentId: null,
              name: '1.',
            },
            mappedChilds: [ //
              {
                item: {
                  id: 2,
                  parentId: 1,
                  name: '1.1.',
                },
                mappedChilds: [],
              },
            ],
          },
        ];
        treehelper.makeTree(list, 'id', 'parentId', function mapFn(item, mappedParent, parent) {
          // map item
          var mappedItem = {
            item: item,
            mappedChilds: [],
          };
          // add to parent
          if (!mappedParent) {
            topLevelList.push(mappedItem);
          } else {
            expect(mappedParent.item).toBe(parent, 'mappedParent should be mapped');
            mappedParent.mappedChilds.push(mappedItem);
          }
          // return mapped item
          return mappedItem;
        });
        expect(topLevelList).toEqual(tree);
      });
    });
  });
});
