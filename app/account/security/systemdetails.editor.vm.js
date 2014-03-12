define('src/account/security/systemdetails.editor.vm', [
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

  var schema;

  schema = {
    _model: true,
    AccountPassword: {},
    PanelTypeId: {},
    SystemTypeId: {},
    CellularTypeId: {},
    DslSeizureId: {},
  };


  function SystemDetailsEditorViewModel(options) {
    var _this = this;
    SystemDetailsEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'item',
      'accountId',
      'panelTypes', 'panelTypeFields',
      'systemTypes', 'systemTypeFields',
      'cellularTypes', 'cellularTypeFields',
      'dslSeizureTypes', 'dslSeizureTypeFields',
    ]);
    _this.mixinLoad();

    _this.data = ukov.wrap(_this.item, schema);

    _this.data.PanelTypeCvm = new ComboViewModel({
      selectedValue: _this.data.PanelTypeId,
      list: _this.panelTypes,
      fields: _this.panelTypeFields,
    });
    _this.data.SystemTypeCvm = new ComboViewModel({
      selectedValue: _this.data.SystemTypeId,
      list: _this.systemTypes,
      fields: _this.systemTypeFields,
    });
    _this.data.CellularTypeCvm = new ComboViewModel({
      selectedValue: _this.data.CellularTypeId,
      list: _this.cellularTypes,
      fields: _this.cellularTypeFields,
    });
    _this.data.DslSeizureCvm = new ComboViewModel({
      selectedValue: _this.data.DslSeizureId,
      list: _this.dslSeizureTypes,
      fields: _this.dslSeizureTypeFields,
    });

    //
    // events
    //
    _this.cmdCancel = ko.command(function(cb) {
      closeLayer(null);
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy();
    });
    _this.cmdSave = ko.command(function(cb) {
      var result = _this.data.getValue();
      alert('//@TODO: actually save data');
      closeLayer(result);
      cb();
    });
    _this.cmdSearch = ko.command(function(cb) {
      cb();
    });

    function closeLayer(result) {
      if (_this.layer) {
        _this.layer.close(result);
      }
    }
  }
  utils.inherits(SystemDetailsEditorViewModel, BaseViewModel);
  SystemDetailsEditorViewModel.prototype.viewTmpl = 'tmpl-security-systemdetails_editor';
  SystemDetailsEditorViewModel.prototype.width = 290;
  SystemDetailsEditorViewModel.prototype.height = 'auto';

  return SystemDetailsEditorViewModel;
});