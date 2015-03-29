define('src/funding/packetitem.editor.vm',[
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
 ], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
){
  "use strict";

  var schema;

  schema = {
    _model: true,
    CustomerMasterFileID: {},
    CustomerId: {},
    AccountId: {},
    PaymentTypeId: {},
    BillingDay: {},
    CurrentMonitoringStation: {},
    PanelTypeId: {},
    IsTakeOver: {},
    IsOwner: {},
    CellPackageItemId: {},
  };
  function PacketItemEditViewModel(options){
    var _this = this;
    PacketItemEditViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'item',
      'panelTypes', 'panelTypeFields',
      // 'systemTypes', 'systemTypeFields',
      'cellularTypes', 'cellularTypeFields',
      // 'dslSeizureTypes', 'dslSeizureTypeFields',
    ]);

    _this.mixinLoad();

    _this.data = ukov.wrap(_this.item, schema);

    _this.data.PanelTypeCvm = new ComboViewModel({
      selectedValue: _this.data.PanelTypeId,
      list: _this.panelTypes,
      fields: _this.panelTypeFields,
    });
    // _this.data.SystemTypeCvm = new ComboViewModel({
    //   selectedValue: _this.data.SystemTypeId,
    //   list: _this.systemTypes,
    //   fields: _this.systemTypeFields,
    // });
    _this.data.CellularTypeCvm = new ComboViewModel({
      selectedValue: _this.data.CellularTypeId,
      list: _this.cellularTypes,
      fields: _this.cellularTypeFields,
    });
    // _this.data.DslSeizureCvm = new ComboViewModel({
    //   selectedValue: _this.data.DslSeizureId,
    //   list: _this.dslSeizureTypes,
    //   fields: _this.dslSeizureTypeFields,
    // });

    //
    // Event
    //
    _this.clickCancel = function (){
      _this.layerResult = null;
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }

    });
    _this.cmdSearch = ko.command(function(cb) {
      cb();
    });

  }
  utils.inherits(PacketItemEditViewModel, BaseViewModel);
  PacketItemEditViewModel.prototype.viewTmpl = 'tmpl-funding-packetitem_editor';
  PacketItemEditViewModel.prototype.width = 290;
  PacketItemEditViewModel.prototype.height = 'auto';

  function closeLayer(_this)
  {
    if(_this.layer)
    {
      _this.layer.close();
    }
  }

  // ** Return class
  return PacketItemEditViewModel;

 });
