define("src/account/security/clist.systemdetails.vm", [
  "src/account/default/rep.find.vm",
  "src/account/security/systemdetails.editor.vm",
  "src/account/security/equipment.vm",
  "src/core/notify",
  "dataservice",
  "ko",
  "src/core/strings",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  RepFindViewModel,
  SystemDetailsEditorViewModel,
  EquipmentViewModel,
  notify,
  dataservice,
  ko,
  strings,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSystemDetailsViewModel(options) {
    var _this = this;
    CListSystemDetailsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["layersVm"]);

    _this.done = ko.computed(function() {
      return this.isDone() ? 'done' : '';
    }, _this);

    _this.mayReload = ko.observable(false);
    _this.repData = ko.observable();
    _this.systemData = ko.observable();
    _this.premiseAddress = ko.observable();

    _this.equipmentVm = new EquipmentViewModel({
      pcontroller: _this,
      layersVm: _this.layersVm,
    });

    //
    // events
    //
    _this.cmdFindRep = ko.command(function(cb) {
      _this.layersVm.show(new RepFindViewModel({
        title: "Technician",
      }), function onClose(result) {
        if (!result) {
          cb();
          return;
        }
        _this.repData(result);
        /** Andres. */
        var model = {
          MsAccountId: _this.accountId,
          CompanyID: result.CompanyID
        };
        dataservice.qualify.technician.post(null, model, null, utils.safeCallback(cb, function(err) {
          if (err) {
            notify.error(err);
          }
        }));
      });
    }, function(busy) {
      return !busy;
    });
    _this.cmdEditSystemDetails = ko.command(function(cb) {
      _this.layersVm.show(new SystemDetailsEditorViewModel({
        item: utils.clone(_this.systemDetails) || {
          AccountID: _this.accountId,
        },
        panelTypes: _this.panelTypes,
        panelTypeFields: {
          value: "PanelTypeID",
          text: "PanelTypeName",
        },
        systemTypes: _this.systemTypes,
        systemTypeFields: {
          value: "SystemTypeID",
          text: "SystemTypeName",
        },
        cellularTypes: _this.cellularTypes,
        cellularTypeFields: {
          value: "CellularTypeID",
          text: "CellularTypeName",
        },
        dslSeizureTypes: _this.dslSeizureTypes,
        dslSeizureTypeFields: {
          value: "DslSeizureID",
          text: "DslSeizure",
        },
      }), function onClose(result) {
        if (result) {
          _this.systemDetails = result;
          _this.updateSystemData();
        }
      });
      cb();
    }, function(busy) {
      return !busy;
    });

    _this.vms = [ // nested view models
      _this.equipmentVm,
    ];
  }
  utils.inherits(CListSystemDetailsViewModel, ControllerViewModel);
  CListSystemDetailsViewModel.prototype.viewTmpl = "tmpl-security-clist_systemdetails";

  CListSystemDetailsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountId = routeData.id;

    _this.vms.forEach(function(vm) {
      vm.load(routeData, extraData, join.add());
    });

    load_types("panelTypes", function(results) {
      _this.panelTypes = results;
    }, join);
    load_types("serviceTypes", function(results) {
      _this.systemTypes = results;
    }, join);
    load_cellularTypes(function(results) {
      _this.cellularTypes = results;
    }, join);
    load_types("dslSeizureTypes", function(results) {
      _this.dslSeizureTypes = results;
    }, join);

    load_systemDetails(routeData.id, function(results) {
      _this.systemDetails = results;
    }, join);

    load_technicianDetails(routeData.id, function(result) {
      _this.repData(result);
    }, join);

    // load credit
    load_customerAccount(_this.accountId, "MONI", function(custAcct) {
      _this.premiseAddress(custAcct ? custAcct.Address : null);
    }, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.updateSystemData();
    });
  };

  CListSystemDetailsViewModel.prototype.updateSystemData = function() {
    var _this = this,
      sd = _this.systemDetails;
    _this.systemData({
      ms: "boh!",
      accountPassword: sd.AccountPassword,
      panelType: findName(_this.panelTypes, sd.PanelTypeId, "PanelTypeID", "PanelTypeName"),
      systemType: findName(_this.systemTypes, sd.SystemTypeId, "SystemTypeID", "SystemTypeName"),
      cellularType: findName(_this.cellularTypes, sd.CellularTypeId, "CellularTypeID", "CellularTypeName"),
      dslSeizure: findName(_this.dslSeizureTypes, sd.DslSeizureId, "DslSeizureID", "DslSeizure"),
    });
  };

  function findName(list, id, idName, displayName) {
    var foundItem;
    list.some(function(item) {
      if (item[idName] === id) {
        foundItem = item;
        return true;
      }
    });
    if (foundItem) {
      return foundItem[displayName];
    } else {
      return "";
    }
  }

  function load_cellularTypes(setter, join) {
    var cb = join.add();
    dataservice.salessummary.cellularTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }, utils.no_op));
  }

  function load_types(typeName, setter, join) {
    var cb = join.add();
    dataservice.msaccountsetupsrv[typeName].read({}, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }));
  }

  function load_systemDetails(accountId, setter, join) {
    var cb = join.add();
    dataservice.msaccountsetupsrv.systemDetails.read({
      id: accountId,
    }, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }));
  }

  function load_technicianDetails(accountId, setter, join) {
    var cb = join.add();
    dataservice.msaccountsetupsrv.techDetails.read({
      id: accountId
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Code === 0) {
        setter(resp.Value);
      }
    }));
  }

  function load_customerAccount(acctid, customerTypeId, setter, cb) {
    dataservice.api_contractAdmin.accounts.read({
      id: acctid,
      link: strings.format("CustomerAccounts/{0}", customerTypeId),
    }, setter, cb);
  }

  return CListSystemDetailsViewModel;
});