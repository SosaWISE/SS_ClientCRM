define("src/account/security/systemdetails.editor.vm", [
  "src/dataservice",
  "src/core/combo.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
  "ko",
  "src/ukov",
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
    AccountID: {},
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
      "item",
      "panelTypes", "panelTypeFields",
      "systemTypes", "systemTypeFields",
      "cellularTypes", "cellularTypeFields",
      "dslSeizureTypes", "dslSeizureTypeFields",
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
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);
      dataservice.msaccountsetupsrv.systemDetails.save({
        id: model.AccountID,
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.layerResult = resp.Value;
        closeLayer(_this);
      }, function(err) {
        notify.error(err);
      }));
    });
    _this.cmdSearch = ko.command(function(cb) {
      cb();
    });
  }
  utils.inherits(SystemDetailsEditorViewModel, BaseViewModel);
  SystemDetailsEditorViewModel.prototype.viewTmpl = "tmpl-security-systemdetails_editor";
  SystemDetailsEditorViewModel.prototype.width = 290;
  SystemDetailsEditorViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  SystemDetailsEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  SystemDetailsEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };

  return SystemDetailsEditorViewModel;
});
