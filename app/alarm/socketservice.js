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

  SocketService.prototype.createRequestUrl = function(id, link /*, queryObj, httpVerb*/ ) { // overrides base
    return link;
  };
  SocketService.prototype.prepareData = function(data) { // overrides base
    return data;
  };

  // make call
  SocketService.prototype.execute = function(context) { // overrides base
    var _this = this,
      cid = context.request.id,
      pkg = protocol.createCallPackage({
        cid: cid,
        method: context.httpVerb,
        path: context.requestUrl,
        data: context.data,
      });

    _this.pendingCalls[cid] = context;
    _this.socket.sendPackage(pkg);
  };

  // handle call result
  SocketService.prototype.handleCallResult = function(pkg) {
    var _this = this,
      context = _this.pendingCalls[pkg.cid];
    if (context) {
      delete _this.pendingCalls[pkg.cid];
      _this.onComplete(pkg.result, null, null, context);
      // notify.warn('WebSocket response', JSON.stringify(pkg.dataArray));
    } else {
      notify.warn('Unexpected WebSocket response', JSON.stringify(pkg.dataArray));
    }
  };

  //@TODO: request timeout??

  return SocketService;
});
