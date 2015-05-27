define("src/account/security/holds.vm", [
  "ko",
  "dataservice",
  "src/account/accthelper",
  "src/account/acctstore",
  "src/account/mscache",
  "src/account/security/hold.new.vm",
  "src/account/security/hold.fix.vm",
  "src/account/security/holds.gvm",
  "src/core/arrays",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  ko,
  dataservice,
  accthelper,
  acctstore,
  mscache,
  HoldNewViewModel,
  HoldFixViewModel,
  HoldGridViewModel,
  arrays,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function HoldsViewModel(options) {
    var _this = this;
    HoldsViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "layersVm",
    ]);

    _this.initHandler();

    _this.gvm = new HoldGridViewModel({
      edit: !_this.layersVm ? null : function(hold) {
        showFix(_this, hold);
      },
      catg2Formatter: function(row, cell, value) {
        return catg2Formatter(value);
      },
      isRepFrontEndHoldFormatter: function(row, cell, id) {
        var catg2 = mscache.getMap("holds/catg2s")[id];
        return (catg2 && catg2.IsRepFrontEndHold) ? "Yes" : "No";
      },
      isRepBackEndHoldFormatter: function(row, cell, id) {
        var catg2 = mscache.getMap("holds/catg2s")[id];
        return (catg2 && catg2.IsRepBackEndHold) ? "Yes" : "No";
      },
    });

    _this.hasRepFrontEndHolds = ko.computed(function() {
      return accthelper.hasRepFrontEndHolds(_this.gvm.fullList());
    });

    //
    // events
    //
    _this.cmdAdd = ko.command(function(cb) {
      showNew(_this, cb);
    }, function(busy) {
      return !busy && _this.layersVm;
    });
  }
  utils.inherits(HoldsViewModel, ControllerViewModel);
  HoldsViewModel.prototype.viewTmpl = "tmpl-security-holds";

  HoldsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.acctid = routeData.id;

    acctStoreSetup(_this, extraData.isReload, join.add());

    // ensure types
    mscache.ensure("holds/catg1s", join.add());
    mscache.ensure("holds/catg2s", join.add());
  };

  function acctStoreSetup(_this, isReload, cb) {
    function done(err, data) {
      if (utils.isFunc(cb)) {
        acctData = (err) ? null : data;
        cb(err);
        cb = null;
      }
    }
    if (_this._off && !isReload) {
      return done();
    }
    var acctData;
    _this.handler.removeOffs().addOff(_this._off = acctstore.on(_this.acctid, [
      "holds",
    ], function(err, data) {
      done(err, data);
      _this.loader(acctStoreChanged, true);
    }, isReload));

    //
    _this.gvm.fullList([]); // incase of reload
    function acctStoreChanged() {
      _this.gvm.fullList(acctData.holds || []);
    }
  }

  function catg2Formatter(id) {
    var catg2 = mscache.getMap("holds/catg2s")[id];
    if (!catg2) {
      return strings.format("({0})", id);
    }
    id = catg2.Catg1Id;
    var catg1 = mscache.getMap("holds/catg1s")[id];
    if (!catg1) {
      return strings.format("({0}):{1}", id, catg2.Name);
    }
    return strings.format("{0}:{1}", catg1.Name, catg2.Name);
  }

  function showNew(_this, cb) {
    show(_this, new HoldNewViewModel({
      acctid: _this.acctid,
      catg1s: mscache.getList("holds/catg1s").peek(),
      catg1sFields: mscache.metadata("holds/catg1s"),
      catg2s: mscache.getList("holds/catg2s").peek(),
      catg2sFields: mscache.metadata("holds/catg2s"),
    }), cb);
  }

  function showFix(_this, hold) {
    show(_this, new HoldFixViewModel({
      reason: catg2Formatter(hold.Catg2Id),
      item: utils.clone(hold),
    }));
  }

  function show(_this, vm, cb) {
    if (!_this.layersVm) {
      return cb();
    }
    _this.layersVm.show(vm, function() {
      if (utils.isFunc(cb)) {
        cb(); // call cb with none of the arguments from closing the layer
      }
    });
  }

  return HoldsViewModel;
});
