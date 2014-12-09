/* global describe,it,expect */
define("src/slick/draghub.spec", [
  "ko",
  "src/slick/draghub",
], function(
  ko,
  DragHub
) {
  "use strict";

  describe("DragHub", function() {
    it("should have a `calcGuides` function", function() {
      expect(typeof DragHub.calcGuides).toBe("function");
    });
    it("should have a `fitAllToBounds` function", function() {
      expect(typeof DragHub.fitAllToBounds).toBe("function");
    });

    describe("calcGuides", function() {
      it("should return an array of 3 rectangles", function() {
        // mouse coords {
        //   pageX: 154,
        //   pageY: 101,
        // }
        var data = DragHub.calcGuides({
          type: "before",
          parentRow: 2,
          row: 8,
          cell: 1,
          indent: 10,
        }, {
          top: -15,
          left: 75,
        }, {
          rowHeight: 15,
          dataLength: 10,
          columns: [ //
            {
              width: 50,
            }, {
              width: 40,
            }, {
              width: 45,
            }, {
              width: 45,
            },
          ],
        });
        expect(data.length).toBe(3);
        // pre
        expect(data[0].top).toBe(30);
        expect(data[0].left).toBe(75);
        expect(data[0].width).toBe(60);
        expect(data[0].height).toBe(2);
        // vertical
        expect(data[1].top).toBe(30);
        expect(data[1].left).toBe(135);
        expect(data[1].width).toBe(2);
        expect(data[1].height).toBe(75);
        // sub
        expect(data[2].top).toBe(105);
        expect(data[1].left).toBe(135);
        expect(data[2].width).toBe(120);
        expect(data[2].height).toBe(2);
      });
    });
    describe("fitAllToBounds", function() {
      it("should make all rectangles fit inside bounding rectangle", function() {
        var data = [ //
          // pre
          {
            top: 30,
            left: 75,
            width: 60,
            height: 2,
          },
          // vertical
          {
            top: 30,
            left: 135,
            width: 2,
            height: 75,
          },
          // sub
          {
            top: 105,
            left: 135,
            width: 120,
            height: 2
          },
        ];

        DragHub.fitAllToBounds({
          top: 75,
          left: 105,
          width: 90,
          height: 75,
        }, data);

        // pre
        expect(data[0].top).toBe(-1000);
        expect(data[0].left).toBe(-1000);
        expect(data[0].width).toBe(0);
        expect(data[0].height).toBe(0);
        // vertical
        expect(data[1].top).toBe(75);
        expect(data[1].left).toBe(135);
        expect(data[1].width).toBe(2);
        expect(data[1].height).toBe(30);
        // sub
        expect(data[2].top).toBe(105);
        expect(data[1].left).toBe(135);
        expect(data[2].width).toBe(60);
        expect(data[2].height).toBe(2);
      });
    });
  });
});
