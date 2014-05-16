/* global describe, it, expect */
define('src/core/treehelper.spec', [
  'src/core/treehelper',
], function(treehelper) {
  "use strict";

  describe('treehelper', function() {
    var list, tree;
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
    tree = [ //
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
        treehelper.walkTree(tree, function(item, parent) {
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

    describe('makeTree', function() {

      it('should recursively nest items', function() {
        var topLevelList = treehelper.makeTree(list, 'id', 'parentId');
        expect(topLevelList).toEqual(tree);
      });

      it('should recursively nest and map items', function() {
        var list, tree, topLevelList;
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
        tree = [ //
          {
            wrappedItem: {
              id: 1,
              parentId: null,
              name: '1.',
              childs: [ //
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

        topLevelList = treehelper.makeTree(list, 'id', 'parentId', function mapFn(item, mappedParent, parent) {
          if (mappedParent) {
            expect(mappedParent.wrappedItem).toBe(parent, 'parent should be wrapped');
          }
          // wrap item
          return {
            wrappedItem: item,
          };
        });
        expect(topLevelList).toEqual(tree);
      });

      it('should sort items', function() {
        var tree, topLevelList;
        tree = [ //
          {
            id: 7,
            parentId: null,
            name: '2.',
            childs: [],
          }, {
            id: 1,
            parentId: null,
            name: '1.',
            childs: [ //
              {
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
              }, {
                id: 2,
                parentId: 1,
                name: '1.1.',
                childs: [ //
                  {
                    id: 4,
                    parentId: 2,
                    name: '1.1.2.',
                    childs: [],
                  }, {
                    id: 3,
                    parentId: 2,
                    name: '1.1.1.',
                    childs: [],
                  },
                ],
              },
            ],
          },
        ];

        function sortFn(a, b) {
          // order ids descending
          a = a.id;
          b = b.id;
          if (a > b) {
            return -1;
          } else if (a < b) {
            return 1;
          }
          return 0;
        }

        topLevelList = treehelper.makeTree(list, 'id', 'parentId', null, sortFn);
        expect(topLevelList).toEqual(tree);
        topLevelList = treehelper.makeTree(list, 'id', 'parentId', null, sortFn, true);
        expect(topLevelList).toEqual(tree);
      });

      // it('post-sort should sort items after they are mapped', function() {
      //   var calledSort = false;
      //   treehelper.makeTree(list, 'id', 'parentId', function() {
      //     return undefined;
      //   }, function sortFn(a, b) {
      //     expect(a).toBeDefined();
      //     expect(b).toBeDefined();
      //     return 0;
      //   }, true);
      //   expect(calledSort).toBe(true);
      // });
    });
  });
});
