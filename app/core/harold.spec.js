/* global describe, it, expect, beforeEach */
define("src/core/harold.spec", [
  "src/core/harold"
], function(
  harold
) {
  "use strict";

  describe("harold", function() {
    var h;
    beforeEach(function() {
      // start anew
      h = harold.create();
    });

    it("should have a `fetch` function", function() {
      expect(typeof harold.fetch).toBe("function");
    });
    it("should have an `onFetch` function", function() {
      expect(typeof harold.onFetch).toBe("function");
    });
    it("should have an `offFetch` function", function() {
      expect(typeof harold.offFetch).toBe("function");
    });
    it("should have a `send` function", function() {
      expect(typeof harold.send).toBe("function");
    });
    it("should have an `on` function", function() {
      expect(typeof harold.on).toBe("function");
    });
    it("should have an `off` function", function() {
      expect(typeof harold.off).toBe("function");
    });

    describe("fetch", function() {
      it("should throw exception when the is no `onFetch` function", function() {
        expect(function() {
          h.fetch("evt:name");
        }).toThrow();
      });
      it("should return result of `onFetch` function", function() {
        h.onFetch("evt:name", function() {
          return "abc";
        });
        expect(h.fetch("evt:name")).toBe("abc");
      });
    });

    describe("send", function() {
      it("should run even when there are no subscriptions", function() {
        expect(function() {
          h.send("evt:name");
        }).not.toThrow();
      });
      it("should send data to all subscriptions", function() {
        var sendValues = [];
        h.on("evt:NO", function(data) {
          sendValues.push(data + "NO");
        });
        h.on("evt:name", function(data) {
          sendValues.push(data + "1");
        });
        h.on("evt:name", function(data) {
          sendValues.push(data + "2");
        });
        //
        h.send("evt:name", "val");
        //
        expect(sendValues).toEqual(["val1", "val2"]);
      });
    });
    describe("off", function() {
      it("should remove subscriptions that match eventName and function", function() {
        var sendValues = [];
        //
        function a1(data) {
          sendValues.push(data + "1");
        }
        //
        function a2(data) {
          sendValues.push(data + "2");
        }
        //
        h.on("evt:a", a1);
        h.on("evt:a", a1); // duplicates are allowed...
        h.on("evt:a", a2);
        //
        h.send("evt:a", "one");
        // remove
        h.off("evt:a", a2);
        //
        h.send("evt:a", "two");
        //
        expect(sendValues).toEqual(["one1", "one1", "one2", "two1", "two1"]);
      });
      it("no function should remove all subscriptions that match eventName", function() {
        var sendValues = [];
        h.on("evt:a", function() {
          sendValues.push("a1");
        });
        h.on("evt:a", function() {
          sendValues.push("a2");
        });
        h.on("evt:b", function() {
          sendValues.push("b1");
        });
        // remove all for event
        h.off("evt:a");
        //
        h.send("evt:a", "val");
        h.send("evt:b", "val");
        //
        expect(sendValues).toEqual(["b1"]);
      });
      it("no eventName and no function should remove all subscriptions", function() {
        var sendValues = [];
        h.on("evt:a", function() {
          sendValues.push("a1");
        });
        h.on("evt:a", function() {
          sendValues.push("a2");
        });
        h.on("evt:b", function() {
          sendValues.push("b1");
        });
        // remove all
        h.off();
        //
        h.send("evt:a", "val");
        h.send("evt:b", "val");
        //
        expect(sendValues).toEqual([]);
      });
    });
    describe("once", function() {
      it("should be called only one time", function() {
        var sendValues = [];
        h.once("evt:a", function(data) {
          sendValues.push(data + "a1");
        });
        //
        h.send("evt:a", "val");
        h.send("evt:a", "val");
        //
        expect(sendValues).toEqual(["vala1"]);
      });
      it("should be removed by `off`", function() {
        var sendValues = [];
        //
        function a1(data) {
          sendValues.push(data + "a1");
        }
        h.once("evt:a", a1);
        //
        h.off("evt:a", a1);
        //
        expect(sendValues).toEqual([]);
      });
    });
  });
});
