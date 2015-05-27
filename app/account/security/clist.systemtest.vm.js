define("src/account/security/clist.systemtest.vm", [
  "src/account/security/devicetests.gvm",
  "dataservice",
  "src/account/security/signalhistory.vm",
  "src/ukov",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  DeviceTestsGridViewModel,
  dataservice,
  SignalHistoryViewModel,
  ukov,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSystemTestViewModel(options) {
    var _this = this;
    CListSystemTestViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
    ]);

    _this.mayReload = ko.observable(false);
    _this.signalHistoryVm = new SignalHistoryViewModel({
      layersVm: _this.layersVm,
    });

    _this.clearingTest = ko.observable(false);
    _this.twoWayTestData = ko.observable();
    _this.confirmedBy = ukov.wrap("", {
      validators: [
        ukov.validators.isRequired("Confirmation code is required"),
      ],
    });

    _this.gvm = new DeviceTestsGridViewModel({
      clearTest: function(item) {
        if (_this.clearingTest.peek()) {
          return;
        }
        notify.confirm("Are you sure?", "Do really you want to clear test " + item.TestNum + "?", function(result) {
          if (result !== "yes") {
            return;
          }

          function cb(err) {
            notify.error(err);
          }
          _this.clearingTest(true);
          clearTest(_this.accountId, item.TestNum, function(err) {
            _this.clearingTest(false);
            if (err) {
              return cb(err);
            }
            reloadActiveTests(_this, cb);
          });
        });
      },
    });

    //
    // events
    //
    _this.cmdInitTwoWay = ko.command(function(cb) {
      initTwoWayTest(_this, function(err) {
        if (err) {
          cb(err);
          return;
        }
        reloadActiveTests(_this, cb);
      });
    }, function(busy) {
      return !busy && !_this.cmdRefreshGrid.busy() && !_this.cmdClearAllTests.busy() &&
        !_this.clearingTest() &&
        !_this.gvm.hasTwoWayTest();
    });
    _this.cmdSaveConfirmation = ko.command(function(cb) {
      saveConfirmation(_this, cb);
    }, function(busy) {
      return !busy && !_this.cmdInitTwoWay.busy();
    });
    //
    _this.cmdRefreshGrid = ko.command(function(cb) {
      reloadActiveTests(_this, cb);
    }, function(busy) {
      return !busy && !_this.cmdInitTwoWay.busy() && !_this.cmdClearAllTests.busy() &&
        !_this.clearingTest();
    });
    _this.cmdClearAllTests = ko.command(function(cb) {
      notify.confirm("Are you sure?", "Do really you want to clear all tests?", function(result) {
        if (result !== "yes") {
          return cb();
        }
        _this.clearingTest(true);
        clearActiveTests(_this.accountId, function(err) {
          _this.clearingTest(false);
          if (err) {
            return cb(err);
          }
          reloadActiveTests(_this, cb);
        });
      });
    }, function(busy) {
      return !busy && !_this.cmdInitTwoWay.busy() && !_this.cmdRefreshGrid.busy() &&
        !_this.clearingTest();
    });
    _this.tcmdServiceState = ko.command(function(cb) {
      var toggle = _this.tcmdServiceState.toggle,
        inService = !toggle.isDown();
      setServiceStatus(_this, inService, function(oosCat) {
        toggle.isDown(oosCat.InService);
      }, cb);
    }, null, {
      toggle: {
        isDown: ko.observable(false),
        down: {
          cls: "active",
          text: "In Service",
          title: "Click to put `Out of Service`",
        },
        up: {
          text: "Out of Service",
          title: "Click to put `In Service`",
        },
      }
    });

    _this.vms = [ // nested view models
      _this.signalHistoryVm,
    ];
  }
  utils.inherits(CListSystemTestViewModel, ControllerViewModel);
  CListSystemTestViewModel.prototype.viewTmpl = "tmpl-security-clist_systemtest";

  CListSystemTestViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.accountId = routeData.id;

    _this.vms.forEach(function(vm) {
      vm.load(routeData, extraData, join.add());
    });

    reloadActiveTests(_this, join.add());
    loadTwoWayTestData(_this, join.add());
    loadServiceStatus(_this, join.add());
  };

  function reloadActiveTests(_this, cb) {
    var gvm = _this.gvm;
    gvm.list([]);
    dataservice.monitoringstationsrv.msAccounts.read({
      id: _this.accountId,
      link: "ActiveTests",
    }, gvm.list, cb);
  }

  function clearActiveTests(accountId, cb) {
    dataservice.monitoringstationsrv.msAccounts.save({
      id: accountId,
      link: "ClearActiveTests",
    }, null, cb);
  }

  function clearTest(accountId, testNum, cb) {
    dataservice.monitoringstationsrv.msAccounts.save({
      id: accountId,
      link: "ClearTest",
      query: {
        testNum: testNum,
      },
    }, null, cb);
  }

  function twoWayTestDataHandler(_this, data) {
    _this.twoWayTestData(data);
    if (data) {
      _this.confirmedBy.setValue(data.ConfirmedBy);
      _this.confirmedBy.markClean();
    }
  }

  function loadTwoWayTestData(_this, cb) {
    dataservice.monitoringstationsrv.msAccounts.read({
      id: _this.accountId,
      link: "TwoWayTestData",
    }, function(data) {
      twoWayTestDataHandler(_this, data);
    }, cb);
  }

  function initTwoWayTest(_this, cb) {
    dataservice.monitoringstationsrv.msAccounts.save({
      id: _this.accountId,
      link: "InitTwoWayTest",
    }, function(data) {
      twoWayTestDataHandler(_this, data);
    }, cb);
  }

  function saveConfirmation(_this, cb) {
    var confirmedBy = _this.confirmedBy;
    if (!confirmedBy.isValid()) {
      notify.warn(confirmedBy.errMsg(), null, 7);
      return cb();
    }
    dataservice.monitoringstationsrv.msAccounts.save({
      id: _this.accountId,
      link: "CompleteTwoWayTest",
      query: {
        confirmedBy: confirmedBy.getValue(),
      }
    }, function(data) {
      twoWayTestDataHandler(_this, data);
    }, cb);
  }

  function loadServiceStatus(_this, cb) {
    dataservice.monitoringstationsrv.msAccounts.read({
      id: _this.accountId,
      link: "ServiceStatus",
    }, function(oosCat) {
      _this.tcmdServiceState.toggle.isDown(oosCat.InService);
    }, cb);
  }

  function setServiceStatus(_this, oosCat, setter, cb) {
    dataservice.monitoringstationsrv.msAccounts.save({
      id: _this.accountId,
      link: "ServiceStatus",
      query: {
        oosCat: oosCat,
      },
    }, setter, cb);
  }

  return CListSystemTestViewModel;
});
