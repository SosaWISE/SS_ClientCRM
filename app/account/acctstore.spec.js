/* global describe, it, expect, jasmine, beforeEach */
define("src/account/acctstore.spec", [
  "src/account/acctstore",
], function(
  acctstore
) {
  "use strict";

  describe("AcctStore", function() {
    beforeEach(function() {
      acctstore = acctstore.new();
    });

    describe("on", function() {
      it("should load all links and call callbacks one time", function() {
        jasmine.Clock.useMock();

        var acctid = 1;
        var loaded = [];
        var callOrder = [];
        acctstore.load = function(type, id, link, setter, cb) {
          window.setTimeout(function() {
            loaded.push(link);
            cb(null, {
              Value: link,
            });
          }, (function() {
            switch (link) {
              case "holds":
                return 20;
              case "accountSalesInformations":
                return 5;
            }
            return 5000;
          })());
        };

        acctstore.on(acctid, [
          "holds",
          "accountSalesInformations",
        ], function(err, data) {
          expect(err).toBeFalsy();
          callOrder.push("a");
          expect(data.holds).toBe("holds");
          expect(data.accountSalesInformations).toBe("accountSalesInformations");
        });
        //
        jasmine.Clock.tick(20);
        //
        expect(loaded).toEqual(["accountSalesInformations", "holds"]);
        expect(callOrder).toEqual(["a"]);

        //
        acctstore.on(acctid, [
          "holds",
          "accountSalesInformations",
        ], function(err, data) {
          expect(err).toBeFalsy();
          callOrder.push("b");
          expect(data.holds).toBe("holds");
          expect(data.accountSalesInformations).toBe("accountSalesInformations");
        });
        //
        jasmine.Clock.tick(10);
        //
        expect(loaded).toEqual(["accountSalesInformations", "holds"]);
        expect(callOrder).toEqual(["a", "b"]);
      });

      it("should reload errored links", function() {
        jasmine.Clock.useMock();

        var acctid = 1;
        var loaded = [];
        var callCount = 0;
        acctstore.load = function(type, id, link, setter, cb) {
          window.setTimeout(function() {
            loaded.push(link);
            var err = link === "holds";
            cb(err, {
              Value: link,
            });
          }, 0);
        };

        acctstore.on(acctid, [
          "holds",
          "accountSalesInformations",
        ], function(err, data) {
          expect(err).toBeTruthy();
          callCount++;
          expect(data.holds).toBeNull();
          expect(data.accountSalesInformations).toBe("accountSalesInformations");
        });
        //
        jasmine.Clock.tick(10);
        //
        expect(loaded).toEqual(["holds", "accountSalesInformations"]);
        expect(callCount).toBe(1);

        //
        acctstore.on(acctid, [
          "holds",
          "accountSalesInformations",
        ], function(err, data) {
          expect(err).toBeTruthy();
          callCount++;
          expect(data.holds).toBeNull();
          expect(data.accountSalesInformations).toBe("accountSalesInformations");
        });
        //
        jasmine.Clock.tick(10);
        //
        expect(loaded).toEqual(["holds", "accountSalesInformations", "holds"]);
        expect(callCount).toBe(3);
      });


      describe("with invalidate", function() {
        it("should immediately call fully loaded listeners", function() {
          jasmine.Clock.useMock();

          var acctid = 1;
          var loaded = [];
          var callOrder = [];
          acctstore.load = function(type, id, link, setter, cb) {
            window.setTimeout(function() {
              loaded.push(link);
              cb(null, {
                Value: link,
              });
            }, (function() {
              switch (link) {
                case "holds":
                  return 10;
                case "accountSalesInformations":
                  return 15;
                case "serviceTickets":
                  return 40;
              }
              return 5000;
            })());
          };

          acctstore.on(acctid, [
            "holds",
            "accountSalesInformations",
          ], function(err, data) {
            callOrder.push("a");
            expect(data).toBeDefined();
          });
          acctstore.on(acctid, [
            "holds",
            "accountSalesInformations",
            "serviceTickets",
          ], function(err, data) {
            callOrder.push("b");
            expect(data).toBeDefined();
          });

          jasmine.Clock.tick(10);
          expect(loaded).toEqual(["holds"]);
          expect(callOrder).toEqual([]);

          jasmine.Clock.tick(5);
          expect(loaded).toEqual(["holds", "accountSalesInformations"]);
          expect(callOrder).toEqual(["a"]);

          // invalidate on load
          acctstore.on(acctid, [
            "holds",
            "accountSalesInformations",
          ], function(err, data) {
            callOrder.push("c");
            expect(data).toBeDefined();
          }, null, true);

          // `a` gets called, but not `b`
          jasmine.Clock.tick(10);
          expect(loaded).toEqual(["holds", "accountSalesInformations", "holds"]);
          expect(callOrder).toEqual(["a", "a"]);

          jasmine.Clock.tick(5);
          expect(loaded).toEqual(["holds", "accountSalesInformations", "holds", "accountSalesInformations"]);
          expect(callOrder).toEqual(["a", "a", "a", "c"]);

          jasmine.Clock.tick(10);
          expect(loaded).toEqual(["holds", "accountSalesInformations", "holds", "accountSalesInformations", "serviceTickets"]);
          expect(callOrder).toEqual(["a", "a", "a", "c", "b"]);
        });
      });
    });
  });
});
