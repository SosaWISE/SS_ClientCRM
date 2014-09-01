define('src/alarm/protocol', [
  'src/core/jsonhelpers',
], function(
  jsonhelpers
) {
  "use strict";

  var protocol = {},
    packetTypeList = [
      'PREFIX',
      'WELCOME',
      'CALL',
      'CALLRESULT',
      'EVENT'
    ],
    packetTypes = {};
  packetTypeList.forEach(function(ptype, index) {
    packetTypes[ptype] = index;
  });

  protocol.packetTypes = packetTypes;
  protocol.createPacket = function(packetType, dataArray) {
    return new Packet(packetType, dataArray);
  };
  protocol.createCallPacket = function(obj) {
    return new Packet(packetTypes.CALL, [
      obj.cid, // 0
      obj.method, // 1
      obj.path, // 2
      obj.data, // 3
    ]);
  };
  protocol.decodePacket = function(str) {
    var pckt, packetType = Number(str.charAt(0));
    if (packetType < 0 || packetTypeList.length <= packetType) {
      throw new Error('unsupported packet type ' + packetType);
    }

    pckt = new Packet(packetType, jsonhelpers.parse(str.substr(1)));
    switch (packetType) {
      // case packetTypes.PREFIX:
      // case packetTypes.WELCOME:
      //   break;
      case packetTypes.CALL:
        pckt.cid = pckt.dataArray[0];
        pckt.method = pckt.dataArray[1];
        pckt.path = pckt.dataArray[2];
        pckt.data = pckt.dataArray[3];
        break;
      case packetTypes.CALLRESULT:
        pckt.cid = pckt.dataArray[0];
        pckt.result = pckt.dataArray[1];
        break;
      case packetTypes.EVENT:
        pckt.eventName = pckt.dataArray[0];
        pckt.data = pckt.dataArray[1];
        break;
    }
    return pckt;
  };

  //
  // Packet
  //
  function Packet(packetType, dataArray) {
    var _this = this;
    _this.packetType = packetType;
    _this.dataArray = dataArray;
  }
  Packet.prototype.encode = function() {
    var _this = this;
    // '4["eventName",obj]
    return _this.packetType + jsonhelpers.stringify(_this.dataArray);
  };

  return protocol;
});
