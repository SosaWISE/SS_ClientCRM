define('src/scrum/chat.vm', [
  'src/app',
  'src/ukov',
  'src/scrum/ws',
  'ko',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  app,
  ukov,
  ws,
  ko,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var rand = Math.random();

  function ChatViewModel(options) {
    var _this = this,
      typingMsgs;
    ChatViewModel.super_.call(_this, options);
    // BaseViewModel.ensureProps(_this, []);

    _this.msg = ukov.wrap('', {
      converter: ukov.converters.string(),
      validators: [ukov.validators.isRequired()],
    });
    _this.focus = ko.observable(false);
    _this.show = ko.observable(false);
    _this.msgs = ko.observableArray();
    typingMsgs = ko.observableArray();
    _this.allMsgs = ko.computed(function() {
      return _this.msgs().concat(typingMsgs());
    });

    function getData() {
      var user = app.user.peek();
      return {
        senderId: rand,
        name: user.Username,
        text: _this.msg.getValue(),
      };
    }

    //
    ws.on('chat:message:add', _this, function(data) {
      data.isTime = false;
      data.typing = false;
      _this.msgs.push(data);
    });
    ws.on('chat:message:typing', _this, function(data) {
      var index = -1;
      typingMsgs.peek().some(function(item, i) {
        if (item.senderId === data.senderId) {
          // set found index
          index = i;
          // remove
          typingMsgs.splice(index, 1);
          return true;
        }
      });
      if (data.text) {
        // add
        data.isTime = false;
        data.typing = true;
        if (index > -1) {
          // add at index
          typingMsgs.splice(index, 0, data);
        } else {
          // add at end
          typingMsgs.push(data);
        }
      }
    });
    ws.on('time', _this, function(data) {
      var list = _this.msgs.peek(),
        lastMsg = list[list.length - 1];
      if (lastMsg && lastMsg.isTime) {
        // remove last message if it was just the time
        _this.msgs.splice(list.length - 1, 1);
      }
      // add new time message
      _this.msgs.push({
        isTime: true,
        typing: false,
        name: '',
        text: strings.formatters.datetimesec(data),
      });
    });
    ws.on('authorized', _this, function(data) {
      notify.info(strings.format('Authorized {0} for {1}.', data.User, data.FuncName), null, 5);
    });

    //
    // events
    //
    _this.clickToggle = function() {
      _this.show(!_this.show());
    };
    _this.clickSend = function() {
      _this.focus(true);
      if (!_this.msg.isValid()) {
        ////////////TESTING//////////////////////////
        ws.get('/controller/action/123/link', {
          a: 1,
          b: 2,
        }, null, function(err, resp) {
          console.log('ws rpc resp:', resp);
        });
        ////////////TESTING//////////////////////////
        return;
      }
      ws.sendJson('chat:message:add', getData());
      _this.msg.setValue('');
    };
    _this.msg.subscribe(function() {
      ws.sendJson('chat:message:typing', getData());
    });
  }
  utils.inherits(ChatViewModel, BaseViewModel);
  ChatViewModel.prototype.viewTmpl = 'tmpl-scrum_chat';

  ChatViewModel.prototype.asdf = function() {

  };

  return ChatViewModel;
});
