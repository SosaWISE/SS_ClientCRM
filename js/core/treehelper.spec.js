/* global describe, it, expect */
define('src/core/treehelper.spec', [
  'src/core/treehelper',
], function(treehelper) {
  "use strict";

  describe('treehelper', function() {
    var list, tree;
    list = [
      {
        id: 1,
        parentId: null,
        name: '1.',
      },
      {
        id: 2,
        parentId: 1,
        name: '1.1.',
      },
      {
        id: 3,
        parentId: 2,
        name: '1.1.1.',
      },
      {
        id: 4,
        parentId: 2,
        name: '1.1.2.',
      },
      {
        id: 5,
        parentId: 1,
        name: '1.2.',
      },
      {
        id: 6,
        parentId: 5,
        name: '1.2.1.',
      },
    ];
    tree = [
      {
        id: 1,
        parentId: null,
        name: '1.',
        childs: [
          {
            id: 2,
            parentId: 1,
            name: '1.1.',
            childs: [
              {
                id: 3,
                parentId: 2,
                name: '1.1.1.',
                childs: [],
              },
              {
                id: 4,
                parentId: 2,
                name: '1.1.2.',
                childs: [],
              },
            ],
          },
          {
            id: 5,
            parentId: 1,
            name: '1.2.',
            childs: [
              {
                id: 6,
                parentId: 5,
                name: '1.2.1.',
                childs: [],
              },
            ],
          },
        ],
      }
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
        expectedIds = [1, 2, 3, 4, 5, 6];
        treehelper.walkTree(tree, function(item, parent) {
          // removes first item
          var id = expectedIds.shift();
          if (id === 1) {
            expect(parent).toBeNull();
          } else {
            expect(parent).toBeDefined();
          }
          expect(item.id).toBe(id);
        });
        expect(expectedIds.length).toBe(0);
      });
    });

    describe('makeTree', function() {

      it('should recursively nest items', function() {
        var topLevelList = treehelper.makeTree(list, 'id', 'parentId', false, null);
        expect(topLevelList).toEqual(tree);
      });

      it('should recursively nest and map items', function() {
        function mapFn(item, mappedParent, parent) {
          if (mappedParent) {
            expect(mappedParent.wrappedItem).toBe(parent, 'parent should be wrapped');
          }
          // wrap item
          return {
            wrappedItem: item,
          };
        }

        var list, tree, topLevelList;
        list = [
          {
            id: 1,
            parentId: null,
            name: '1.',
          },
          {
            id: 2,
            parentId: 1,
            name: '1.1.',
          },
        ];
        tree = [
          {
            wrappedItem: {
              id: 1,
              parentId: null,
              name: '1.',
              childs: [
                {
                  wrappedItem: {
                    id: 2,
                    parentId: 1,
                    name: '1.1.',
                    childs: [],
                  },
                },
              ],
            },
          },
        ];

        topLevelList = treehelper.makeTree(list, 'id', 'parentId', false, mapFn);
        expect(topLevelList).toEqual(tree);
      });
    });
  });
});
