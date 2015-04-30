/* global describe, it, expect, beforeEach */
define("src/core/authorize.spec", [
  "src/core/authorize",
], function(authorize) {
  "use strict";

  // jasmine.Clock.useMock();
  // jasmine.Clock.tick(500);

  describe("authorize", function() {
    beforeEach(function() {
      // overwrite with new
      authorize = authorize.create();
    });

    describe("handleResponse", function() {

      it("should call callback with correct parameters", function() {
        var responseData = {};
        var textStatus = {};
        var xhr = {};
        var context = {};
        var callCount = 0;

        authorize.handleResponse(responseData, textStatus, xhr, context,
          function onComplete(p1, p2, p3, p4) {
            callCount++;
            expect(p1).toBe(responseData);
            expect(p2).toBe(textStatus);
            expect(p3).toBe(xhr);
            expect(p4).toBe(context);
          }, function retryExecute() {

          }
        );

        expect(callCount).toBe(1);
      });
    });

    describe("execute", function() {

      it("should call callback with correct parameters", function() {
        var ctx = {};
        var callCount = 0;
        authorize.execute(ctx, function(param) {
          callCount++;
          expect(param).toBe(ctx);
        });

        expect(callCount).toBe(1);
      });
    });

    describe("when logged out", function() {
      var responseData;
      var textStatus;
      var xhr;
      var context;
      beforeEach(function() {
        responseData = {
          Code: 401,
          Value: {
            ApplicationId: null,
            ActionId: null,
          },
        };
        textStatus = {};
        xhr = {};
        context = {};
        // overwrite with new
        authorize = authorize.create();
      });

      describe("handleResponse", function() {

        it("callback should not be called", function() {
          var callCount = 0;

          authorize.handleResponse(responseData, textStatus, xhr, context,
            function onComplete() {
              callCount++;
            }, function retryExecute() {

            }
          );

          expect(callCount).toBe(0);
        });
      });

      describe("execute", function() {

        it("callback should not be called", function() {
          //
          authorize.handleResponse(responseData);
          //
          var ctx = {};
          var callCount = 0;
          authorize.execute(ctx, function() {
            callCount++;
          });

          expect(callCount).toBe(0);
        });
      });
    });


  });
});
