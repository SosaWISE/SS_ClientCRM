define("src/account/security/holds.vm", [
  "ko",
  "src/dataservice",
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

    function catg2Formatter(value) {
      var catg2 = arrays.findById(_this.catg2s, value, "Catg2ID");
      if (!catg2) {
        return strings.format("({0})", value);
      }
      value = catg2.Catg1Id;
      var catg1 = arrays.findById(_this.catg1s, value, "Catg1ID");
      if (!catg1) {
        return strings.format("({0}):{1}", value, catg2.CatgName);
      }
      return strings.format("{0}:{1}", catg1.CatgName, catg2.CatgName);
    }

    _this.gvm = new HoldGridViewModel({
      edit: !_this.layersVm ? null : function(hold, cb) {
        showFix(_this, hold, catg2Formatter, cb);
      },
      catg2Formatter: function(row, cell, value) {
        return catg2Formatter(value);
      },
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
    var _this = this,
      tempHolds;

    _this.acctid = routeData.id;

    load_category("catg1s", function(val) {
      _this.catg1s = val;
    }, join.add());
    load_category("catg2s", function(val) {
      _this.catg2s = val;
    }, join.add());
    load_accountHolds(_this.acctid, function(list) {
      tempHolds = list;
    }, join.add());

    _this.gvm.setList([]); // incase of reload
    join.when(function(err) {
      if (err) {
        return;
      }
      _this.gvm.setList(tempHolds);
    });
  };

  function showNew(_this, cb) {
    if (!_this.layersVm) {
      return cb();
    }
    _this.layersVm.show(new HoldNewViewModel({
      acctid: _this.acctid,
      catg1s: _this.catg1s,
      catg1sFields: {
        value: "Catg1ID",
        text: "CatgName",
      },
      catg2s: _this.catg2s,
      catg2sFields: {
        value: "Catg2ID",
        text: "CatgName",
      },
    }), cb);
  }

  function showFix(_this, hold, catg2Formatter, cb) {
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

  function load_category(category, setter, cb) {
    dataservice.api_ms.holds.read({
      link: category,
    }, setter, cb);
  }

  return HoldsViewModel;
});
