/* global describe, it, expect, waitsFor, runs */
(function() {
  "use strict";

  define("1circularA", ["1circularB"], function(b) {
    return "A" + b;
  });
  define("1circularB", ["1circularA"], function(a) {
    return "B" + a; // "a" should be undefined
  });

  define("2circularA", ["2circularB"], function(b) {
    return "A" + b;
  });
  define("2circularB", ["2circularC"], function(c) {
    return "B" + c;
  });
  define("2circularC", ["2circularD"], function(d) {
    return "C" + d;
  });
  define("2circularD", ["2circularE"], function(e) {
    return "D" + e;
  });
  define("2circularE", ["2circularA"], function(a) {
    return "E" + a; // "a" should be undefined
  });

  describe("depends", function() {

    it("define function should be defined", function() {
      expect(typeof(window.define)).toBe("function");
    });
    it("require function should be defined", function() {
      expect(typeof(window.require)).toBe("function");
    });

    describe("cirular dependencies", function() {
      it("should be stopped before they are started", function() {
        var a;
        require("1circularA", function(param) {
          a = param;
        });
        waitsFor(function() {
          return a;
        }, 1000);
        runs(function() {
          expect(a).toBe("ABundefined");
        });
      });
      it("should be stopped at any level", function() {
        var a;
        require("2circularA", function(param) {
          a = param;
        });
        waitsFor(function() {
          return a;
        }, 1000);
        runs(function() {
          expect(a).toBe("ABCDEundefined");
        });
      });
    });

    describe("packages", function() {
      function findScriptTagsBySrc(src) {
        var elements = document.getElementsByTagName("script"),
          results = [],
          i;
        for (i = elements.length; i--;) {
          if (elements[i].getAttribute("src") === src) {
            results.push(elements[i]);
          }
        }
        return results;
      }

      it("should load package file before trying to load dependencies contained in package", function() {
        var a, b, filepath = "/app/depends/fixtures/pkg1-joined.js";
        expect(findScriptTagsBySrc(filepath).length).toBe(0, "script file should not exist");
        require("src/pkg1/a", function(param) {
          a = param;
        });
        require("src/pkg1/b", function(param) {
          b = param;
        });
        waitsFor(function() {
          return a;
        }, 1000);
        runs(function() {
          expect(findScriptTagsBySrc(filepath).length).toBe(1, "should add script file once per package");
          expect(a).toBe("A");
          expect(b).toBe("B");
          expect(require("src/pkg1/c")).toBe("C", "C should be defined since it is part of pkg1");
        });
      });
    });
  });
})();
