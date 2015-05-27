define("src/account/security/summary.vm", [
  "dataservice",
  "ko",
  "src/account/accthelper",
  "src/account/acctstore",
  "src/account/mscache",
  "src/account/security/emcontacts.vm",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  dataservice,
  ko,
  accthelper,
  acctstore,
  mscache,
  EmContactsViewModel,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SummaryViewModel(options) {
    var _this = this;
    SummaryViewModel.super_.call(_this, options);

    _this.mayReload = ko.observable(false);
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });
    _this.initHandler();

    _this.emcontactsVm = new EmContactsViewModel({
      layersVm: _this.layersVm,
    });

    _this.statuses = ko.observableArray();
    // _this.acctStatusInfos = ko.observableArray();
    // _this.statuses = ko.computed(function() {
    //   var list = _this.acctStatusInfos();
    //   return list;
    // });

    _this.contractStatuses = ko.observableArray();

    //
    // events
    //

    _this.vms = [ // nested view models
      _this.emcontactsVm,
    ];
  }
  utils.inherits(SummaryViewModel, ControllerViewModel);
  SummaryViewModel.prototype.viewTmpl = "tmpl-security-summary";

  SummaryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    var acctid = _this.acctid = routeData.id;

    acctStoreSetup(_this, extraData.isReload, join.add());

    mscache.ensure("holds/catg2s", join.add());

    _this.vms.forEach(function(vm) {
      vm.load(routeData, extraData, join.add());
    });

    _this.statuses.removeAll(); // incase of reload
    load_accountStatusInformations(acctid, _this.statuses, join.add());
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
      "accountSalesInformations",
    ], function(err, data) {
      done(err, data);
      _this.loader(acctStoreChanged, true);
    }, isReload));

    //
    _this.contractStatuses([]); // incase of reload
    function acctStoreChanged() {
      if (!acctData) {
        return;
      }
      var salesinfo = acctData.accountSalesInformations;
      var holds = acctData.holds;
      if (!salesinfo || !holds) {
        return;
      }
      var name = "Contract: ";
      var hasHolds = accthelper.hasRepFrontEndHolds(holds);
      var status = accthelper.contractStatus(salesinfo.CancelDate, salesinfo.ApproverID, hasHolds);
      name += status;
      _this.contractStatuses([{
        name: name,
        title: name,
        status: status,
      }]);
    }
  }

  function load_accountStatusInformations(acctid, setter, cb) {
    dataservice.monitoringstationsrv.msAccountStatusInformations.read({
      id: acctid,
    }, function(list) {
      setter(list.map(function(item) {
        return {
          name: item.KeyName,
          title: item.Value,
          status: item.Status.toLowerCase(),
        };
      }));
    }, cb);
  }

  return SummaryViewModel;
});
