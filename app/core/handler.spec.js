/* global describe, it, expect, beforeEach */
define("src/core/handler.spec", [
  "src/core/harold",
  "src/core/handler",
], function(
  harold,
  Handler
) {
  "use strict";

  describe("Handler", function() {
    var handler;
    beforeEach(function() {
      // start anew
      handler = new Handler();
      harold = harold.create();
    });

    describe("on", function() {
      it("should add subscriptions to harold", function() {
        var sendValues = [];
        handler.on(harold, "evt:name", function(data) {
          sendValues.push(data + "1");
        });
        handler.on(harold, "evt:name", function(data) {
          sendValues.push(data + "2");
        });
        //
        harold.send("evt:name", "val");
        //
        expect(sendValues).toEqual(["val1", "val2"]);
      });
    });
    describe("offall", function() {
      it("should remove all subscriptions", function() {
        var sendValues = [];
        handler.on(harold, "evt:name", function(data) {
          sendValues.push(data + "1");
        });
        handler.on(harold, "evt:name", function(data) {
          sendValues.push(data + "2");
        });
        //
        handler.offAll();
        //
        harold.send("evt:name", "val");
        //
        expect(sendValues).toEqual([]);
      });
    });
    describe("off", function() {
      it("should remove subscriptions that match event and func", function() {
        var eventName = "evt";
        var sendValues = [];
        //
        function _1(data) {
          sendValues.push(data + "1");
        }
        //
        function _2(data) {
          sendValues.push(data + "2");
        }
        //
        handler.on(harold, eventName, _1);
        var harold2 = harold; //.create();
        handler.on(harold2, eventName, _1);
        handler.on(harold, eventName, _2);
        //
        harold.send(eventName, "a");
        // remove
        handler.off(eventName, _2);
        //
        harold.send(eventName, "b");
        //
        expect(sendValues).toEqual(["a1", "a1", "a2", "b1", "b1"]);
      });
    });
  });
});
