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
    _this.onopen = utils.noop;
    _this.onclose = utils.noop;
    _this.onerror = utils.noop;

    //
    _this.reconnect = function() {
      if (!_this.connected.peek()) {
        createWebSocket(_this, uri);
      }
    };
    _this.reconnect();
  }
  Socket.prototype.service = function() {
    var _this,
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
    _this.connected(false);
    // notify.info('WebSocket connection closed', null, 5);
    _this.onclose(evt);
  };
  Socket.prototype.handleError = function(evt) {
    var _this = this;
    _this.connected(false);
    // notify.warn('WebSocket error', JSON.stringify(evt), 5);
    _this.onerror(evt);
  };
  Socket.prototype.handleMessage = function(evt) {
    var _this = this,
      pckt;
    try {
      pckt = protocol.decodePacket(evt.data);
    } catch (ex) {
      //@TODO: do something with errors??
      notify.warn('handleMessage error', ex, 5);
      return;
    }
    switch (pckt.packetType) {
      // case protocol.packetTypes.PREFIX:
      // case protocol.packetTypes.WELCOME:
      //   break;
      case protocol.packetTypes.CALL:
        _this.handleCall(pckt);
        break;
      case protocol.packetTypes.CALLRESULT:
        _this.service().handleCallResult(pckt);
        break;
      case protocol.packetTypes.EVENT:
        _this.howie.send(pckt.eventName, pckt.data);
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
      pckt = protocol.createPacket(protocol.packetTypes.EVENT, [eventName, obj]);
    _this.sendPacket(pckt);
  };

  //
  // Socket static functions
  //
  Socket.prototype.sendPacket = function(pckt) {
    var _this = this;
    _this.transport.send(pckt.encode());
  };

  return Socket;
});
