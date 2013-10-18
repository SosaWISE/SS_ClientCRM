define('spec/app/spec.harold', [
  'src/harold'
], function(
  harold
) {
  "use strict";

  describe('harold', function() {
    var h;
    beforeEach(function() {
      // start anew
      h = harold.create();
    });

    it('should have a `fetch` function', function() {
      expect(typeof harold.fetch).toBe('function');
    });
    it('should have an `onFetch` function', function() {
      expect(typeof harold.onFetch).toBe('function');
    });
    it('should have an `unFetch` function', function() {
      expect(typeof harold.unFetch).toBe('function');
    });
    it('should have a `send` function', function() {
      expect(typeof harold.send).toBe('function');
    });
    it('should have an `onSend` function', function() {
      expect(typeof harold.onSend).toBe('function');
    });
    it('should have an `unSend` function', function() {
      expect(typeof harold.unSend).toBe('function');
    });

    describe('fetch', function() {
      it('should throw exception when the is no `onFetch` function', function() {
        expect(function() {
          h.fetch('evt:name');
        }).toThrow();
      });
      it('should return result of `onFetch` function', function() {
        var ctx = {}, result = 'onFetch result';
        h.onFetch('evt:name', ctx, function() {
          return result;
        });
        expect(h.fetch('evt:name')).toBe(result);
      });
    });

    describe('send', function() {
      it('should run even when there are no `onSend` functions', function() {
        expect(function() {
          h.send('evt:name');
        }).not.toThrow();
      });
      it('should send data to all `onSend` functions', function() {
        var ctx = {}, sendValues = [];
        h.onSend('evt:NO', ctx, function(data) {
          sendValues.push(data + 'NO');
        });
        h.onSend('evt:name', ctx, function(data) {
          sendValues.push(data + '1');
        });
        h.onSend('evt:name', ctx, function(data) {
          sendValues.push(data + '2');
        });
        //
        h.send('evt:name', 'val');
        //
        expect(sendValues.length).toBe(2);
        expect(sendValues[0]).toBe('val1');
        expect(sendValues[1]).toBe('val2');
      });
      it('should call `onSend` functions with correct context', function() {
        var ctx = {}, sendCtx;
        h.onSend('evt:name', ctx, function() {
          sendCtx = this;
        });
        //
        h.send('evt:name', 'val');
        //
        expect(sendCtx).toBe(ctx);
      });
    });
    describe('unSend', function() {
      it('should remove `onSend` functions that match eventName and context', function() {
        var ctx1 = {}, ctx2 = {},
          sendValues = [];
        h.onSend('evt:a', ctx1, function(data) {
          sendValues.push(data + 'a1');
        });
        h.onSend('evt:a', ctx2, function(data) {
          sendValues.push(data + 'a2');
        });
        h.onSend('evt:b', ctx1, function(data) {
          sendValues.push(data + 'b1');
        });
        h.onSend('evt:b', ctx2, function(data) {
          sendValues.push(data + 'b2');
        });
        // remove
        h.unSend('evt:a', ctx1);
        h.unSend('evt:b', ctx2);
        //
        h.send('evt:a', 'val');
        h.send('evt:b', 'val');
        expect(sendValues.length).toBe(2);
        expect(sendValues[0]).toBe('vala2');
        expect(sendValues[1]).toBe('valb1');
      });
      it('no context should remove all `onSend` functions that match eventName', function() {
        var ctx1 = {}, ctx2 = {},
          sendValues = [];
        h.onSend('evt:a', ctx1, function() {
          sendValues.push('a1');
        });
        h.onSend('evt:a', ctx2, function() {
          sendValues.push('a2');
        });
        // remove all
        h.unSend('evt:a', null);
        //
        h.send('evt:a', 'val');
        expect(sendValues.length).toBe(0);
      });
    });
  });
});
