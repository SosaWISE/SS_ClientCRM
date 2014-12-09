/* global describe, it, expect, beforeEach */
define("src/scrum/storys.vm.spec", [
  "src/core/relativesort",
  "src/scrum/storys.vm",
], function(
  RelativeSort,
  StorysViewModel
) {
  "use strict";

  describe("storys.vm", function() {
    function addItem(vm, type, item) {
      StorysViewModel.ensureItemMetadata(item, type);
      vm.updateItem(item, false);
    }


    function addF(vm, name, sortOrder) {
      addItem(vm, "f", {
        ID: ++featureCount,
        Name: name,
        SortOrder: sortOrder,
      });
    }

    function findItemByName(vm, name) {
      var result;
      vm.dv.getItems().some(function(item) {
        if (item.Name === name) {
          result = item;
          return true;
        }
      });
      return result;
    }

    function addS(vm, pName, name, sortOrder) {
      var parent = findItemByName(vm, pName);
      addItem(vm, "s", {
        FeatureId: parent.ID,
        ID: ++storyCount,
        Name: name,
        SortOrder: sortOrder,
      });
    }

    function addT(vm, pName, name, sortOrder) {
      var parent = findItemByName(vm, pName);
      addItem(vm, "t", {
        StoryId: parent.ID,
        ID: ++taskCount,
        Name: name,
        SortOrder: sortOrder,
      });
    }

    // var epics, storys, bd;
    var fromVm, vm;
    var featureCount, storyCount, taskCount;
    beforeEach(function() {
      // coolerVm
      fromVm = StorysViewModel.create(null, {
        indentOffset: 0,
        accepts: function( /*item*/ ) {
          return false; //@TODO:
        },
        takes: function(item) {
          return (item.Points == null || item.SortOrder == null);
        },
        rsort: new RelativeSort({
          start: 0,
          increment: 5,
        }),
      });

      // storyBoardVm
      vm = StorysViewModel.create(null, {
        indentOffset: 0,
        accepts: function( /*item*/ ) {
          return true; //@TODO:
        },
        takes: function(item) {
          return (item.Points != null && item.SortOrder != null) && item.SortOrder >= 0;
        },
        rsort: new RelativeSort({
          zero: (1 << 30), // 1073741824
          increment: (1 << 14), // 16384
          min: 1,
        }),
      });
    });

    it("should have a `canDropItem` function", function() {
      expect(typeof vm.canDropItem).toBe("function");
    });

    describe("w/ items canDropItem", function() {
      beforeEach(function() {
        featureCount = storyCount = taskCount = 0;

        // coolerVm
        addF(fromVm, "4.", 900);
        addS(fromVm, "4.", "4.1.", 90);
        addT(fromVm, "4.1.", "4.1.1.", 9);

        // storyBoardVm
        vm.beginUpdate();
        // 1.
        //    1.1.
        //    1.2.
        //          1.2.1.
        //          1.2.2.
        //    1.3.
        addF(vm, "1.", 900);
        addS(vm, "1.", "1.1.", 90);
        addS(vm, "1.", "1.2.", 50);
        addT(vm, "1.2.", "1.2.1.", 9);
        addT(vm, "1.2.", "1.2.2.", 5);
        addS(vm, "1.", "1.3.", 10);
        // 2.
        //    2.1.
        //          2.1.1.
        //    2.2.
        addF(vm, "2.", 500);
        addS(vm, "2.", "2.1.", 90);
        addT(vm, "2.1.", "2.1.1.", 9);
        addS(vm, "2.", "2.2.", 50);
        // 3.
        addF(vm, "3.", 100);
        //
        vm.endUpdate();
      });

      function canDropItemNull(fromRow, beforeRow) {
        describe("fromRow:" + fromRow + ", beforeRow:" + beforeRow, function() {
          it("should be null", function() {
            expect(vm.canDropItem(fromVm.dv, fromRow, beforeRow)).toBe(null);
          });
        });
      }

      function canDropItem(fromRow, beforeRow, row, parentRow, parentItemName, prevItemName, nextItemName) {
        describe("fromRow:" + fromRow + ", beforeRow:" + beforeRow, function() {
          var dd;
          beforeEach(function() {
            dd = vm.canDropItem(fromVm.dv, fromRow, beforeRow);
          });
          it("dropData should not be null", function() {
            expect(dd).not.toBe(null);
          });
          it("type should be `before`", function() {
            if (dd) {
              expect(dd.type).toBe("before");
            }
          });
          it("row should be " + row, function() {
            if (dd) {
              expect(dd.row).toBe(row);
            }
          });
          it("parentRow should be " + parentRow, function() {
            if (dd) {
              expect(dd.parentRow).toBe(parentRow);
            }
          });
          it("parentItem should be " + parentItemName, function() {
            if (dd) {
              expect(dd.parentItem ? dd.parentItem.Name : null).toBe(parentItemName);
            }
          });
          it("prevItem should be " + prevItemName, function() {
            if (dd) {
              expect(dd.prevItem ? dd.prevItem.Name : null).toBe(prevItemName);
            }
          });
          it("nextItem should be " + nextItemName, function() {
            if (dd) {
              expect(dd.nextItem ? dd.nextItem.Name : null).toBe(nextItemName);
            }
          });
        });
      }

      describe("for a top level item", function() {
        var fromRow = 0;
        var beforeRow = 0;
        //          fromRow, beforeRow), row, pRow, prev, next);
        canDropItem(fromRow, beforeRow++, 0, null, null, null, "1.");
        canDropItem(fromRow, beforeRow++, 6, null, null, "1.", "2.");
        canDropItem(fromRow, beforeRow++, 6, null, null, "1.", "2.");
        canDropItem(fromRow, beforeRow++, 6, null, null, "1.", "2.");
        canDropItem(fromRow, beforeRow++, 6, null, null, "1.", "2.");
        canDropItem(fromRow, beforeRow++, 6, null, null, "1.", "2.");
        canDropItem(fromRow, beforeRow++, 6, null, null, "1.", "2.");
        canDropItem(fromRow, beforeRow++, 10, null, null, "2.", "3.");
        canDropItem(fromRow, beforeRow++, 10, null, null, "2.", "3.");
        canDropItem(fromRow, beforeRow++, 10, null, null, "2.", "3.");
        canDropItem(fromRow, beforeRow++, 10, null, null, "2.", "3.");
        canDropItem(fromRow, beforeRow++, 11, null, null, "3.", null);
      });
      describe("for a second level item", function() {
        var fromRow = 1;
        var beforeRow = 0;
        canDropItemNull(fromRow, beforeRow++);
        //          fromRow, beforeRow), row, pRow, prev, next);
        canDropItem(fromRow, beforeRow++, 1, 0, "1.", null, "1.1.");
        canDropItem(fromRow, beforeRow++, 2, 0, "1.", "1.1.", "1.2.");
        canDropItem(fromRow, beforeRow++, 5, 0, "1.", "1.2.", "1.3.");
        canDropItem(fromRow, beforeRow++, 5, 0, "1.", "1.2.", "1.3.");
        canDropItem(fromRow, beforeRow++, 5, 0, "1.", "1.2.", "1.3.");
        canDropItem(fromRow, beforeRow++, 6, 0, "1.", "1.3.", null);
        canDropItem(fromRow, beforeRow++, 7, 6, "2.", null, "2.1.");
        canDropItem(fromRow, beforeRow++, 9, 6, "2.", "2.1.", "2.2.");
        canDropItem(fromRow, beforeRow++, 9, 6, "2.", "2.1.", "2.2.");
        canDropItem(fromRow, beforeRow++, 10, 6, "2.", "2.2.", null);
        canDropItem(fromRow, beforeRow++, 11, 10, "3.", null, null);
      });
      describe("for a third level item", function() {
        var fromRow = 2;
        var beforeRow = 0;
        canDropItemNull(fromRow, beforeRow++);
        canDropItemNull(fromRow, beforeRow++);
        //          fromRow, beforeRow), row, pRow, prev, next);
        canDropItem(fromRow, beforeRow++, 2, 1, "1.1.", null, null);
        canDropItem(fromRow, beforeRow++, 3, 2, "1.2.", null, "1.2.1.");
        canDropItem(fromRow, beforeRow++, 4, 2, "1.2.", "1.2.1.", "1.2.2.");
        canDropItem(fromRow, beforeRow++, 5, 2, "1.2.", "1.2.2.", null);
        canDropItem(fromRow, beforeRow++, 6, 5, "1.3.", null, null);
        canDropItemNull(fromRow, beforeRow++);
        canDropItem(fromRow, beforeRow++, 8, 7, "2.1.", null, "2.1.1.");
        canDropItem(fromRow, beforeRow++, 9, 7, "2.1.", "2.1.1.", null);
        canDropItem(fromRow, beforeRow++, 10, 9, "2.2.", null, null);
        //
        canDropItemNull(fromRow, beforeRow++);
      });
    });
  });
});
