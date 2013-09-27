define(['dataservice.base'], function(DataserviceBase) {
  "use strict";

  describe('dataservice.base', function() {
    var sb;
    beforeEach(function() {
      sb = new DataserviceBase('collectionName');
    });
    afterEach(function() {});

    it('should construct baseUrl', function() {
      expect(sb.baseUrl).toBe('/collectionName');
    });

    describe('createRequestUrl', function() {
      describe('with an id and no link', function() {
        var requestUrl;
        beforeEach(function() {
          requestUrl = sb.createRequestUrl('id', null, {
            p1: 'p1val',
            p2: 'p2val',
          });
        });

        it('should construct requestUrl correctly', function() {
          expect(requestUrl).toBe('/collectionName/id?p1=p1val&p2=p2val');
        });
      });

      describe('with a no id and no link', function() {
        var requestUrl;
        beforeEach(function() {
          requestUrl = sb.createRequestUrl(null, null, {
            p1: 'p1val',
            p2: 'p2val',
          });
        });

        it('should construct requestUrl correctly', function() {
          expect(requestUrl).toBe('/collectionName?p1=p1val&p2=p2val');
        });
      });

      describe('with a link and no id', function() {
        var requestUrl;
        beforeEach(function() {
          requestUrl = sb.createRequestUrl(null, 'link', {
            p1: 'p1val',
            p2: 'p2val',
          });
        });

        it('should construct requestUrl correctly', function() {
          expect(requestUrl).toBe('/collectionName/link?p1=p1val&p2=p2val');
        });
      });

      describe('with an id and a link', function() {
        var requestUrl;
        beforeEach(function() {
          requestUrl = sb.createRequestUrl('id', 'link', {
            p1: 'p1val',
            p2: 'p2val',
          });
        });

        it('should construct requestUrl correctly', function() {
          expect(requestUrl).toBe('/collectionName/id/link?p1=p1val&p2=p2val');
        });
      });
    });

    describe('onComplete', function() {
      var context, called, callbackArgs, responseData, xhr;
      beforeEach(function() {
        called = false;

        context = {
          request: {
            id: 0,
            time: new Date(),
          },
          requestUrl: 'requestUrl',
          httpVerb: "GET",
          data: null,
          callback: function(responseData, context) {
            callbackArgs = [responseData, context];
            called = true;
          },
        };
        responseData = {};
        xhr = {
          responseText: '{"name":"val"}'
        };

        sb.onComplete(responseData, 'textStatus', xhr, context);
      });

      it('should call callback', function() {
        expect(called).toBe(true);
      });
      it('should call callback with responseData as first parameter', function() {
        expect(callbackArgs[0]).toBe(responseData);
      });
      it('should call callback with context as second parameter', function() {
        expect(callbackArgs[1]).toBe(context);
      });
      it('context should have response property', function() {
        expect(callbackArgs[1].response).toBeDefined();
        expect(callbackArgs[1].response.xhr).toBe(xhr);
      });
    });

    describe('onError', function() {
      var context, called, callbackArgs, responseData, xhr;
      beforeEach(function() {
        called = false;

        context = {
          request: {
            id: 0,
            time: new Date(),
          },
          requestUrl: 'requestUrl',
          httpVerb: "GET",
          data: null,
          callback: function(responseData, context) {
            callbackArgs = [responseData, context];
            called = true;
          },
        };
        responseData = {};
        xhr = {
          responseText: '{"name":"val"}'
        };

        sb.onError(xhr, 'textStatus', 'errorThrown', context);
      });
      afterEach(function() {});

      it('should call callback', function() {
        expect(called).toBe(true);
      });
      it('should call callback with responseData as first parameter', function() {
        expect(callbackArgs[0]).toBeDefined();
      });
      it('responseData should have `Code`, `Message` and `Value` properties', function() {
        expect(callbackArgs[0].Code).toBeDefined();
        expect(callbackArgs[0].Message).toBeDefined();
        expect(callbackArgs[0].Value).toBeDefined();
      });
      it('responseData should have "responseText" json parsed as `Value` property', function() {
        expect(callbackArgs[0].Value).toBeDefined();
        expect(callbackArgs[0].Value.name).toBe('val');
      });
      it('should call callback with context as second parameter', function() {
        expect(callbackArgs[1]).toBe(context);
      });
      it('context should have `response` property', function() {
        expect(callbackArgs[1].response).toBeDefined();
        expect(callbackArgs[1].response.xhr).toBe(xhr);
      });
    });
  });
});
