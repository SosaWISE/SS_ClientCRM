define("src/account/security/dispatchagencys.finder.vm", [
  "src/account/default/address.validate.vm",
  "src/core/combo.vm",
  "dataservice",
  "ko",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/ukov",
  "src/core/notify",
  "src/core/base.vm",
  "src/core/utils",
], function(
  AddressValidateViewModel,
  ComboViewModel,
  dataservice,
  ko,
  RowEvent,
  SlickGridViewModel,
  ukov,
  notify,
  BaseViewModel,
  utils
) {
  "use strict";

  var schema;

  schema = {
    _model: true,

    CityName: {
      validators: [
        ukov.validators.isRequired("City name is required"),
      ],
    },
    StateAB: {
      validators: [
        ukov.validators.isRequired("State is required"),
      ],
    },
    ZipCode: {
      validators: [
        ukov.validators.isRequired("Zip code is required"),
      ],
    },
  };

  function DispatchAgencysFinderViewModel(options) {
    var _this = this;
    DispatchAgencysFinderViewModel.super_.call(_this, options);

    _this.mixinLoad();
    _this.initFocusFirst();

    _this.accountId = options.accountId;
    _this.data = ukov.wrap({
      CityName: "",
      StateAB: "",
      ZipCode: "",
    }, schema);

    _this.data.StateCvm = new ComboViewModel({
      selectedValue: _this.data.StateAB,
      list: AddressValidateViewModel.prototype.stateOptions, //@TODO: load states from server
      nullable: true,
    });

    _this.gvm = new SlickGridViewModel({
      gridOptions: {
        multiSelect: true,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      // plugins: [
      //   new RowEvent({
      //     eventName: "onDblClick",
      //     fn: function(item) {
      //       console.log(item);
      //       if (_this.selectedAgencies == null) {
      //         _this.selectedAgencies = [];
      //       }
      //       _this.selectedAgencies.push(item);
      //       _this.cmdSelect.execute();
      //     },
      //   }),
      // ],
      columns: [ //
        {
          id: "ID",
          name: "ID",
          field: "DispatchAgencyID",
          width: 30,
        }, {
          id: "AgencyType",
          name: "Agency Type",
          field: "DispatchAgencyType",
        }, {
          id: "AgencyNo",
          name: "Agency #",
          field: "MsAgencyNumber",
        }, {
          id: "AgencyName",
          name: "Agency Name",
          field: "DispatchAgencyName",
        }, {
          id: "DispatchPhone",
          name: "Dispatch Phone",
          field: "Phone1",
        },
      ],
      onSelectedRowsChanged: function(rows) {
        _this.selectedAgencies = rows;
      },
    });

    //
    // events
    //
    _this.cmdFind = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb(_this.data.errMsg());
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);

      _this.gvm.list([]);
      dataservice.monitoringstationsrv.dispatchAgencies.read({
        query: model,
      }, _this.gvm.list, utils.safeCallback(cb, notify.iferror));

    }, function(busy) {
      return !busy && !_this.cmdSelect.busy();
    });

    _this.cmdSelect = ko.command(function(cb) {
      if (!_this.selectedAgencies || !_this.selectedAgencies.length) {
        notify.warn("Please select a dispatch agency", null, 7);
        cb();
        return;
      }
      dataservice.monitoringstationsrv.msAccounts.save({
        id: _this.accountId,
        link: "DispatchAgencyAssignments",
        data: _this.selectedAgencies,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.layerResult = resp.Value;
        closeLayer(_this);
      }, function(err) {
        notify.error(err);
      }));
    }, function(busy) {
      return !busy && _this.gvm.list().length;
    });
  }
  utils.inherits(DispatchAgencysFinderViewModel, BaseViewModel);
  DispatchAgencysFinderViewModel.prototype.viewTmpl = "tmpl-security-dispatchagencys_finder";
  DispatchAgencysFinderViewModel.prototype.width = 600;
  DispatchAgencysFinderViewModel.prototype.height = "auto";
  DispatchAgencysFinderViewModel.prototype.onLoad = function() {
    var _this = this;

    dataservice.monitoringstationsrv.premiseAddress.read({
      id: _this.accountId,
      link: "AccountId",
    }, null, utils.safeCallback(function(err, resp) {
      var premAddress = resp.Value,
        data = {
          CityName: premAddress.City,
          StateAB: premAddress.StateId,
          ZipCode: premAddress.PostalCode,
        };
      _this.data.setValue(data);
      _this.data.markClean(data, true);

    }, notify.iferror));
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  DispatchAgencysFinderViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  DispatchAgencysFinderViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSelect.busy() && !_this.layerResult) {
      msg = "Please wait for the agency to be selected.";
    }
    return msg;
  };

  return DispatchAgencysFinderViewModel;
});
