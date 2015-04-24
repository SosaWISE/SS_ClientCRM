define("src/account/security/holds.vm", [
  "ko",
  "src/dataservice",
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
    // utils.assertProps(_this, [
    //   "layersVm",
    // ]);

    _this.gvm = new HoldGridViewModel({
      edit: !_this.layersVm ? null : function(hold, cb) {
        showFix(_this, hold, cb);
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
      var map = mscache.getMap("holds/catg2s");
      return _this.gvm.internalList().some(function(item) {
        // exclude fixed holds
        if (!!item.FixedOn) {
          return false;
        }
        var catg2 = map[item.Catg2Id];
        return catg2 && catg2.IsRepFrontEndHold;
      });
    });

    //
    // events
    //
    _this.cmdAdd = ko.command(function(cb) {
      showNew(_this, function(item) {
        if (item) {
          _this.gvm.addItem(item);
        }
        cb();
      });
    }, function(busy) {
      return !busy && _this.layersVm;
    });
  }
  utils.inherits(HoldsViewModel, ControllerViewModel);
  HoldsViewModel.prototype.viewTmpl = "tmpl-security-holds";

  HoldsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.acctid = routeData.id;

    function step1() {
      // start next step when done
      var subjoin = join.create()
        .after(utils.safeCallback(join.add(), step2, utils.noop));
      // ensure types
      mscache.ensure("holds/catg1s", subjoin.add());
      mscache.ensure("holds/catg2s", subjoin.add());
    }

    _this.gvm.setList([]); // incase of reload
    function step2() {
      var subjoin = join;
      //
      load_accountHolds(_this.acctid, function(list) {
        _this.gvm.setList(list);
      }, subjoin.add());
    }

    // start at first step
    step1();
  };

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
    if (!_this.layersVm) {
      return cb();
    }
    _this.layersVm.show(new HoldNewViewModel({
      acctid: _this.acctid,
      catg1s: mscache.getList("holds/catg1s").peek(),
      catg1sFields: mscache.metadata("holds/catg1s"),
      catg2s: mscache.getList("holds/catg2s").peek(),
      catg2sFields: mscache.metadata("holds/catg2s"),
    }), cb);
  }

  function showFix(_this, hold, cb) {
    if (!_this.layersVm) {
      return cb();
    }
    _this.layersVm.show(new HoldFixViewModel({
      reason: catg2Formatter(hold.Catg2Id),
      item: utils.clone(hold),
    }), cb);
  }

  function load_accountHolds(acctid, setter, cb) {
    dataservice.api_ms.accounts.read({
      id: acctid,
      link: "holds",
    }, setter, cb);
  }

  return HoldsViewModel;
});
