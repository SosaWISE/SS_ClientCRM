define([
  'notify',
  'ko'
], function(
  notify,
  ko
) {
  "use strict";

  describe('notify', function() {
    var n;
    beforeEach(function() {
      // start anew
      n = notify.create();
    });

    it('should have a `create` function', function() {
      expect(notify.create).toBeDefined();
      expect(typeof notify.create).toBe('function');
    });

    it('should have a `notify` function', function() {
      expect(notify.notify).toBeDefined();
      expect(typeof notify.notify).toBe('function');
    });

    it('should have a `send` function', function() {
      expect(notify.send).toBeDefined();
      expect(typeof notify.send).toBe('function');
    });
    it('should have an `info` function', function() {
      expect(notify.info).toBeDefined();
      expect(typeof notify.info).toBe('function');
    });
    it('should have an `ok` function', function() {
      expect(notify.ok).toBeDefined();
      expect(typeof notify.ok).toBe('function');
    });
    it('should have a `warn` function', function() {
      expect(notify.warn).toBeDefined();
      expect(typeof notify.warn).toBe('function');
    });
    it('should have an `error` function', function() {
      expect(notify.error).toBeDefined();
      expect(typeof notify.error).toBe('function');
    });

    describe('add notification', function() {
      var item;
      beforeEach(function() {
        n.notify('typeVal', 'messageVal');
        item = n.list()[0];
      });

      it('should add to list', function() {
        expect(n.list().length).toBe(1);
        expect(item).toBeDefined();
      });
      it('added item should have correct fields', function() {
        expect(item.minTimeout).toBe(5);
        expect(item.type).toBe('typeVal');
        expect(item.message).toBe('messageVal');
        expect(item.actions).toBeDefined();
        expect(ko.isObservable(item.seconds)).toBe(true);
      });
      it('dismiss should remove it from the list', function() {
        item.dismiss();
        expect(n.list().length).toBe(0);
      });
    });

    describe('add notification with timeout', function() {
      var item;
      beforeEach(function() {
        jasmine.Clock.useMock();

        n.notify('typeVal', 'messageVal', 10);
        item = n.list()[0];

        jasmine.Clock.tick(1000 * 9);
      });

      it('item should be removed from the list after timeout has elapsed', function() {
        expect(n.list().length).toBe(1);
        jasmine.Clock.tick(1000 * 1);
        expect(n.list().length).toBe(0);
      });
      it('when paused the item should NOT be removed from the list after timeout has elapsed', function() {
        item.pause();
        jasmine.Clock.tick(1000 * 1);
        expect(n.list().length).toBe(1);
      });
      it('when the seconds are less than or equal to minTimeout, pause should set seconds to minTimeout plus 1', function() {
        expect(item.seconds()).toBe(1);
        item.pause();
        expect(item.seconds()).toBe(6);
      });
      it('resume should restart the timeout', function() {
        item.pause();
        item.resume();
        jasmine.Clock.tick(1000 * 5);
        expect(n.list().length).toBe(1);
        jasmine.Clock.tick(1000 * 1);
        expect(n.list().length).toBe(0);
      });
    });

    describe('add notification with actions', function() {
      var actions, actionObj;
      beforeEach(function() {
        actionObj = jasmine.createSpyObj('actionObj', ['view', 'retry']);

        n.notify('typeVal', 'messageVal', 0, actionObj);
        actions = n.list()[0].actions;
      });

      it('item.actions should match expected', function() {
        expect(actions).toBeDefined();
        expect(actions.length).toBe(3);

        expect(actions[0].name).toBe('view');
        expect(actions[0].action).toBeDefined();
        expect(typeof(actions[0].action)).toBe('function');

        expect(actions[1].name).toBe('retry');
        expect(actions[1].action).toBeDefined();
        expect(typeof(actions[1].action)).toBe('function');

        expect(actions[2].name).toBe('dismiss');
        expect(actions[2].action).toBeDefined();
        expect(typeof(actions[2].action)).toBe('function');
      });

      it('should call action named `view`', function() {
        expect(actionObj.view).not.toHaveBeenCalled();
        expect(actionObj.retry).not.toHaveBeenCalled();

        actions[0].action();
        expect(actionObj.view).toHaveBeenCalled();
        expect(actionObj.retry).not.toHaveBeenCalled();
      });

      it('should call action named `retry`', function() {
        expect(actionObj.view).not.toHaveBeenCalled();
        expect(actionObj.retry).not.toHaveBeenCalled();

        actions[1].action();
        expect(actionObj.view).not.toHaveBeenCalled();
        expect(actionObj.retry).toHaveBeenCalled();
      });
    });
  });
});
