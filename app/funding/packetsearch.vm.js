define('src/funding/packetsearch.vm', [
  'src/dataservice',
  'src/funding/packetsearch.gvm',
  'src/funding/packetitemsearch.gvm',
  'src/funding/packetitem.editor.vm',
  'ko',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  PacketSearchGridViewModel,
  PacketItemSearchGridViewModel,
  PacketItemEditorViewModel,
  ko,
  ukov,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";
  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    PacketID: {},
    CriteriaName: nullStrConverter,
    CriteriaId: {},
    PurchaserID: {},
    PurchaserName: {},
    SubmittedOn: nullStrConverter,
    SubmittedBy: nullStrConverter,
    CreatedOn: {},
    CreatedBy: {},
  };

  // ctor
  function PacketSearchViewModel(options) {
    var _this = this;
    PacketSearchViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.data = ukov.wrap({}, schema);
    clearData(_this);

    _this.cmdSearch = ko.command(function(cb) {
      search(_this, cb);
    });

    _this.gvm = new PacketSearchGridViewModel({
      open: _this.open || function(item) {
        //console.log(item);
        dataservice.fundingsrv.packetItems.read({
          id: item.PacketID,
        }, null, utils.safeCallback(null, function(err, resp) {
          // set result in grid
          _this.gvmItems.list(resp.Value);
          _this.gvmItems.setSelectedRows([]);
        }, function(err) {
          notify.error(err, 30);
        }));
        return true;
      }
    });

    _this.gvmItems = new PacketItemSearchGridViewModel({
      open: function(item) {
        _this.layersVm.show(new PacketItemEditorViewModel({
          item: utils.clone(_this.packetItem) || {
            PacketItemID: item.PacketItemID
          },
          panelTypes: _this.panelTypes,
          panelTypeFields: {
            value: 'PanelTypeID',
            text: 'PanelTypeName',
          },
          cellularTypes: _this.cellularTypes,
          cellularTypeFields: {
            value: 'CellularTypeID',
            text: 'CellularTypeName',
          },
        }), function onClose(result) {
          if (result) {
            _this.packetItem = result;
            //            _this.updatePacketItemData();
          }
        });
      }
    });
  }
  utils.inherits(PacketSearchViewModel, ControllerViewModel);
  PacketSearchViewModel.prototype.viewTmpl = 'tmpl-funding-packetsearch';
  PacketSearchViewModel.prototype.height = 500;
  PacketSearchViewModel.prototype.width = '80%';

  // ** Load event
  PacketSearchViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    dataservice.fundingsrv.packets.read({}, null, utils.safeCallback(join.add(), function(err, resp) {
      // set result in grid
      _this.gvm.list(resp.Value);
      _this.gvm.setSelectedRows([]);
    }, function(err) {
      notify.error(err, 30);
    }));

    load_types('panelTypes', function(results) {
      _this.panelTypes = results;
    }, join);
    load_cellularTypes(function(results) {
      _this.cellularTypes = results;
    }, join);
  };

  // ** clearData
  function clearData(_this) {
    var data = {
      PacketID: 0,
      CriteriaName: null,
      CriteriaId: 0,
      PurchaserID: 0,
      PurchaserName: null,
      SubmittedOn: null,
      SubmittedBy: null,
      CreatedOn: null,
      CreatedBy: null,
    };

    _this.data.setValue(data);
    _this.data.markClean(data, true);
  }

  // ** Search
  function search(_this, cb) {
    _this.gvm.list([]);

    dataservice.functingsrv.packets.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // set results in grid
      _this.gvm.list(resp.Value);
      _this.gvm.setSelectedRows([]);
    }, function(err) {
      notify.error(err, 30);
    }));
  }

  function load_types(typeName, setter, join) {
    var cb = join.add();
    dataservice.msaccountsetupsrv[typeName].read({}, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }));
  }

  function load_cellularTypes(setter, join) {
    var cb = join.add();
    dataservice.salessummary.cellularTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      setter(resp.Value);
    }, utils.no_op));
  }

  // ** Return class
  return PacketSearchViewModel;
});
