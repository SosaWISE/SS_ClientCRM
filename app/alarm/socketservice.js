define('src/alarm/socketservice', [
  'src/alarm/protocol',
  'src/core/dataservice.base',
  'src/core/notify',
  'src/core/utils',
], function(
  protocol,
  DataserviceBase,
  notify,
  utils
) {
  "use strict";

  function SocketService(socket) {
    var _this = this;
    _this.socket = socket;
    _this.pendingCalls = {};
  }
  utils.inherits(SocketService, DataserviceBase);

  // make call
  SocketService.prototype.execute = function(context) { // overrides base
    var _this = this,
      cid = context.request.id,
      pckt = protocol.createCallPacket({
        cid: cid,
        method: context.httpVerb,
        path: context.requestUrl,
        data: context.data,
      });

    _this.pendingCalls[cid] = context;
    _this.socket.sendPacket(pckt);
  };

  // handle call result
  SocketService.prototype.handleCallResult = function(pckt) {
    var _this = this,
      context = _this.pendingCalls[pckt.cid];
    if (context) {
      delete _this.pendingCalls[pckt.cid];
      _this.onComplete(pckt.data, null, null, context);
      // context.callback(null, resp, {});
      notify.warn('WebSocket response', JSON.stringify(pckt.dataArray));
    } else {
      notify.warn('Unexpected WebSocket response', JSON.stringify(pckt.dataArray));
    }
  };

  //@TODO: request timeout??

  return SocketService;
});
