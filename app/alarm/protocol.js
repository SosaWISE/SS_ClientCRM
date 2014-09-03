define('src/alarm/protocol', [
  'src/core/jsonhelpers',
], function(
  jsonhelpers
) {
  "use strict";

  var protocol = {},
    packageTypeList = [
      'PREFIX',
      'WELCOME',
      'CALL',
      'CALLRESULT',
      'EVENT'
    ],
    packageTypes = {};
  packageTypeList.forEach(function(ptype, index) {
    packageTypes[ptype] = index;
  });

  protocol.packageTypes = packageTypes;
  protocol.createPackage = function(packageType, dataArray) {
    return new Package(packageType, dataArray);
  };

  protocol.createCallPackage = function(obj) {
    return new Package(packageTypes.CALL, [
      obj.cid + '', // 0
      obj.method, // 1
      obj.path, // 2
      obj.data, // 3
    ]);
  };
  protocol.createCallResultPackage = function(obj) {
    return new Package(packageTypes.CALLRESULT, [
      obj.cid + '', // 0
      obj.result, // 1
    ]);
  };

  protocol.decodePackage = function(str) {
    var pkg, packageType = Number(str.charAt(0));
    if (packageType < 0 || packageTypeList.length <= packageType) {
      throw new Error('unsupported package type ' + packageType);
    }

    pkg = new Package(packageType, jsonhelpers.parse(str.substr(1)));
    switch (packageType) {
      // case packageTypes.PREFIX:
      // case packageTypes.WELCOME:
      //   break;
      case packageTypes.CALL:
        pkg.cid = pkg.dataArray[0];
        pkg.method = pkg.dataArray[1];
        pkg.path = pkg.dataArray[2];
        pkg.data = pkg.dataArray[3];
        break;
      case packageTypes.CALLRESULT:
        pkg.cid = pkg.dataArray[0];
        pkg.result = pkg.dataArray[1];
        break;
      case packageTypes.EVENT:
        pkg.eventName = pkg.dataArray[0];
        pkg.data = pkg.dataArray[1];
        break;
    }
    return pkg;
  };

  //
  // Package
  //
  function Package(packageType, dataArray) {
    var _this = this;
    _this.packageType = packageType;
    _this.dataArray = dataArray;
  }
  Package.prototype.encode = function() {
    var _this = this;
    // '4["eventName",obj]
    return _this.packageType + jsonhelpers.stringify(_this.dataArray);
  };

  return protocol;
});
