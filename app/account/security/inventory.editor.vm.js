define('src/account/security/inventory.editor.vm', [
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
) {
  "use strict";

  var schema,
    strConverter = ukov.converters.string();

  schema = {
    _model: true,
    Zone: {
      converter: strConverter,
    },
    ZoneEventType: {},
    ItemLocation: {},
    AssignTo: {},
    UpgradePrice: {},
    MainPanel: {},
  };


  function InventoryEditorViewModel(options) {
    var _this = this;
    InventoryEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      // 'customerId',
      'accountId',
      'phoneOptions',
      'phoneOptionFields',
      'relationshipOptions',
      'relationshipOptionFields',
    ]);

    _this.data = ukov.wrap(_this.item || {
      Zone: '',
      ZoneEventType: '',
      ItemLocation: '',
      AssignTo: '',
      UpgradePrice: '',
      MainPanel: '',
    }, schema);

    _this.data.ZoneEventTypeCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
      list: _this.relationshipOptions,
      fields: _this.relationshipOptionFields,
    });
    _this.data.ItemLocationCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
      list: _this.yesNoOptions,
    });
    _this.data.AssignToCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
      nullable: true,
    });
    _this.data.MainPanelCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
      nullable: true,
    });

    //
    // events
    //
    _this.cmdCancel = ko.command(function(cb) {
      if (_this.layer) {
        _this.layer.close(null);
      }
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy();
    });
    _this.cmdSave = ko.command(function(cb) {
      cb();
    });
  }
  utils.inherits(InventoryEditorViewModel, BaseViewModel);
  InventoryEditorViewModel.prototype.viewTmpl = 'tmpl-security-inventory_editor';
  InventoryEditorViewModel.prototype.width = 550;
  InventoryEditorViewModel.prototype.height = 'auto';

  return InventoryEditorViewModel;
});
