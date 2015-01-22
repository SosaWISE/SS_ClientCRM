define("src/wamp/chat.vm", [
  "src/config",
  "src/app",
  "src/ukov",
  "autobahn",
  "ko",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
  //
  "src/wamp/chat.bindings",
], function(
  config,
  app,
  ukov,
  autobahn,
  ko,
  strings,
  notify,
  utils,
  BaseViewModel
  //
  //chat.bindings is used in html views
) {
  "use strict";

  var rand = Math.random();

  function ChatViewModel(options) {
    var _this = this,
      typingMsgs;
    ChatViewModel.super_.call(_this, options);
    // BaseViewModel.ensureProps(_this, []);

    _this.msg = ukov.wrap("", {
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

    var connection = new autobahn.Connection({
      url: config.wampPath, //"ws://127.0.0.1:9000/",
      realm: "realm1"
    });

    var _sess;
    connection.onopen = function(session, details) {
      details = details;
      _sess = session;

      // // 1) subscribe to a topic
      // session.subscribe("com.myapp.hello", function(args) {
      //   console.log("Event:", args[0]);
      // });
      // // 2) publish an event
      // session.publish("com.myapp.hello", ["Hello, world!"]);

      //
      // 3) register a procedure for remoting
      session.register("com.myapp.add2", function(args) {
        return args[0] + args[1];
      });
      // 4) call a remote procedure
      session.call("com.myapp.add2", [2, 3]).then(
        function(res) {
          console.log("Result:", res);
        }
      );



      //
      session.subscribe("chat.message.add", function(args) {
        var data = args[0];
        data.isTime = false;
        data.typing = false;
        _this.msgs.push(data);
      });
      session.subscribe("chat.message.typing", function(args) {
        var data = args[0];
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
      session.subscribe("time", function(args) {
        var data = args[0];
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
          name: "",
          text: strings.formatters.datetimesec(data),
        });
      });
      session.subscribe("authorized", function(args) {
        var data = args[0];
        notify.info(strings.format("Authorized {0} for {1}.", data.User, data.FuncName), null, 5);
      });
    };
    connection.onclose = function(reason, details) {
      details = details;
    };

    connection.open();

    //
    // events
    //
    _this.clickToggle = function() {
      var show = !_this.show();
      _this.show(show);
      if (show) {
        _this.focus(true);
      }
    };
    _this.clickSend = function() {
      _this.focus(true);
      if (!_this.msg.isValid()) {
        // ////////////TESTING//////////////////////////
        // ws.get("/controller/action/123/link", {
        //   a: 1,
        //   b: 2,
        // }, null, function(err, resp) {
        //   console.log("ws rpc resp:", resp);
        // });
        // ////////////TESTING//////////////////////////
        return;
      }
      if (_sess) {
        _sess.publish("chat.message.add", [getData()]);
        _this.msg.setValue("");
      }
    };
    _this.msg.subscribe(function() {
      if (_sess) {
        _sess.publish("chat.message.typing", [getData()]);
      }
    });
  }
  utils.inherits(ChatViewModel, BaseViewModel);
  ChatViewModel.prototype.viewTmpl = "tmpl-wamp-chat";

  ChatViewModel.prototype.asdf = function() {

  };

  return ChatViewModel;
});
