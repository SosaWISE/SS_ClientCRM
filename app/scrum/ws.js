define('src/scrum/ws', [
  'src/config',
  'src/core/harold',
  'src/core/strings',
  'src/core/jsonhelpers',
  'src/core/notify',
  'src/core/utils',
  'ko',
], function(
  config,
  harold,
  strings,
  jsonhelpers,
  notify,
  utils,
  ko
) {
  "use strict";

  if (!window.WebSocket) {
    // appendLog($("<div><b>Your browser does not support WebSockets.</b></div>"))
    return;
  }

  //@NOTE: from socket.io client
  var packetTypeList = [
      'CONNECT',
      'DISCONNECT',
      'EVENT',
      'BINARY_EVENT',
      'ACK',
      'BINARY_ACK',
      'ERROR'
    ],
    packetTypes = {};
  packetTypeList.forEach(function(ptype, index) {
    packetTypes[ptype] = index;
  });


  function Ws(uri) {
    var _this = this;

    _this.msgs = ko.observableArray();

    _this.howie = harold.create();

    // bind functions to this
    _this.handleOpen = _this.handleOpen.bind(_this);
    _this.handleClose = _this.handleClose.bind(_this);
    _this.handleError = _this.handleError.bind(_this);
    _this.handleMessage = _this.handleMessage.bind(_this);

    //
    createSocket(_this, uri);
  }
  //
  // websocket handlers
  //
  function createSocket(_this, uri) {
    _this.transport = new WebSocket(uri);
    _this.transport.onopen = _this.handleOpen;
    _this.transport.onclose = _this.handleClose;
    _this.transport.onerror = _this.handleError;
    _this.transport.onmessage = _this.handleMessage;
  }
  Ws.prototype.handleOpen = function( /*evt*/ ) {
    notify.warn('WebSocket connection open', null, 2);
  };
  Ws.prototype.handleClose = function( /*evt*/ ) {
    notify.warn('WebSocket connection closed', null, 5);
  };
  Ws.prototype.handleError = function(evt) {
    notify.warn('WebSocket error', JSON.stringify(evt), 5);
  };
  Ws.prototype.handleMessage = function(evt) {
    var _this = this,
      packet = StringPacket.decode(evt.data);
    if (packet instanceof Error) {
      //@TODO: do something with error packets??
      console.warn(packet);
    } else {
      _this.howie.send(packet.data[0], packet.data[1]);
    }
  };
  //
  // Ws member functions
  //
  Ws.prototype.on = function(eventName, ctx, cb) {
    var _this = this;
    _this.howie.onSend(eventName, ctx, cb);
  };
  Ws.prototype.sendJson = function(eventName, obj) {
    var _this = this,
      packet = new StringPacket(packetTypes.EVENT, [eventName, obj]);
    Ws.sendPacket(_this.transport, packet);
  };
  //
  // Ws static functions
  //
  Ws.sendPacket = function(transport, packet) {
    transport.send(packet.encode());
  };


  //
  //
  // StringPacket
  //
  //
  function StringPacket(typeIndex, data) {
    var _this = this;
    _this.typeIndex = typeIndex;
    _this.data = data;
  }
  StringPacket.prototype.encode = function() {
    var _this = this;
    // '2["eventName",obj]
    return _this.typeIndex + jsonhelpers.stringify(_this.data);
  };
  StringPacket.decode = function(str) {
    var typeIndex = Number(str.charAt(0));
    if (typeIndex !== packetTypes.EVENT) {
      return new Error('unsupported type ' + (packetTypeList[typeIndex] || typeIndex));
    }
    return new StringPacket(typeIndex, jsonhelpers.parse(str.substr(1)));
  };

  return new Ws(config.wsPath);
});
