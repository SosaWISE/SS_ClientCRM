/* global describe,it,expect,beforeEach */
define("src/core/utils.spec", [
  "src/core/utils",
], function(utils) {
  "use strict";

  describe("utils", function() {
    // var vm;
    // beforeEach(function() {});

    it("should have an `safeCallback` function", function() {
      expect(typeof(utils.safeCallback)).toBe("function");
    });
    it("should have an `setIfNull` function", function() {
      expect(typeof(utils.setIfNull)).toBe("function");
    });

    describe("safeCallback", function() {
      it("should ", function() {
        // expect(utils.safeCallback()).toBe("");
      });
    });

    describe("setIfNull", function() {
      var obj;
      beforeEach(function() {
        obj = {
          prop1: null,
          prop2: 0,
        };
      });

      it("should set null props", function() {
        utils.setIfNull(obj, "prop1", 1);
        expect(obj.prop1).toBe(1);
      });
      it("should set undefined props", function() {
        utils.setIfNull(obj, "noProp", 1);
        expect(obj.noProp).toBe(1);
      });
      it("should not overwrite defined props", function() {
        utils.setIfNull(obj, "prop2", 2);
        expect(obj.prop2).toBe(0);
      });
    });
  });
});
