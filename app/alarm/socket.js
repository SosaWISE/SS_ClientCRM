define('src/alarm/socket', [
  'ko',
  'src/alarm/protocol',
  'src/alarm/socketservice',
  'src/core/harold',
  'src/core/notify',
  'src/core/utils',
], function(
  ko,
  protocol,
  SocketService,
  harold,
  notify,
  utils
) {
  "use strict";

  if (!window.WebSocket) {
    // appendLog($("<div><b>Your browser does not support WebSockets.</b></div>"))
    return;
  }

  function Socket(uri) {
    var _this = this;

    _this.connected = ko.observable(false);

    _this.howie = harold.create();

    _this.pendingRequests = {};

    // bind functions to this
    _this.handleOpen = _this.handleOpen.bind(_this);
    _this.handleClose = _this.handleClose.bind(_this);
    _this.handleError = _this.handleError.bind(_this);
    _this.handleMessage = _this.handleMessage.bind(_this);
    //
    _this.onopen = utils.noop;
    _this.onclose = utils.noop;
    _this.onerror = utils.noop;
    //
    _this.onCall = utils.noop;

    //
    _this.reconnect = function() {
      if (!_this.connected.peek()) {
        createWebSocket(_this, uri);
      }
    };
    _this.disconnect = function() {
      if (_this.connected.peek()) {
        _this.transport.close();
        _this.transport = null;
        _this.connected(false);
      }
    };
    _this.reconnect();
  }
  Socket.prototype.service = function() {
    var _this = this,
      service = _this._service;
    if (!service) {
      _this._service = service = new SocketService(_this);
    }
    return service;
  };
  //
  // websocket handlers
  //
  function createWebSocket(_this, uri) {
    if (_this.transport) {
      throw new Error('transport already exists');
    }
    _this.transport = new WebSocket(uri);
    _this.transport.onopen = _this.handleOpen;
    _this.transport.onclose = _this.handleClose;
    _this.transport.onerror = _this.handleError;
    _this.transport.onmessage = _this.handleMessage;
    _this.connected(true);
  }
  Socket.prototype.handleOpen = function(evt) {
    var _this = this;
    _this.connected(true);
    // notify.info('WebSocket connection open', null, 2);
    _this.onopen(evt);
  };
  Socket.prototype.handleClose = function(evt) {
    var _this = this;
    _this.disconnect();
    // notify.info('WebSocket connection closed', null, 5);
    _this.onclose(evt);
  };
  Socket.prototype.handleError = function(evt) {
    var _this = this;
    _this.disconnect();
    // notify.warn('WebSocket error', JSON.stringify(evt), 5);
    _this.onerror(evt);
  };
  Socket.prototype.handleMessage = function(evt) {
    var _this = this,
      pkg, result;
    try {
      pkg = protocol.decodePackage(evt.data);
    } catch (ex) {
      //@TODO: do something with errors??
      notify.warn('handleMessage error', ex, 5);
      return;
    }
    switch (pkg.packageType) {
      // case protocol.packageTypes.PREFIX:
      // case protocol.packageTypes.WELCOME:
      //   break;
      case protocol.packageTypes.CALL:
        // handle call
        result = _this.onCall(pkg);
        // respond to call
        _this.sendPackage(protocol.createCallResultPackage({
          cid: pkg.cid,
          result: true,
        }));
        break;
      case protocol.packageTypes.CALLRESULT:
        _this.service().handleCallResult(pkg);
        break;
      case protocol.packageTypes.EVENT:
        _this.howie.send(pkg.eventName, pkg.data);
        break;
    }
  };

  //
  // Socket member functions
  //
  Socket.prototype.on = function(eventName, ctx, cb) {
    var _this = this;
    _this.howie.onSend(eventName, ctx, cb);
  };
  Socket.prototype.emit = function(eventName, obj) {
    var _this = this,
      pkg = protocol.createPackage(protocol.packageTypes.EVENT, [eventName, obj]);
    _this.sendPackage(pkg);
  };
  Socket.prototype.sendPackage = function(pkg) {
    var _this = this;
    _this.transport.send(pkg.encode());
  };

  //
  // Socket static functions
  //

  return Socket;
});
