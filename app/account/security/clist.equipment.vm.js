define('src/account/security/clist.equipment.vm', [
  'ko',
  'src/account/security/equipment.editor.vm',
  'src/account/security/equipment.gvm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/account/security/equipment.vm',
], function(
  ko,
  EquipmentEditorViewModel,
  EquipmentGridViewModel,
  LayersViewModel,
  notify,
  utils,
  EquipmentViewModel
) {
  "use strict";

  function CListEquipmentViewModel(options) {
    var _this = this;
    CListEquipmentViewModel.super_.call(_this, options);
    _this.ensureProps(['layersVm', 'pcontroller']);
  }
  utils.inherits(CListEquipmentViewModel, EquipmentViewModel);
  // CListEquipmentViewModel.prototype.viewTmpl = 'tmpl-security-clist_equipment';

  CListEquipmentViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    _this.accountId = routeData.id;

    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };

  return CListEquipmentViewModel;
});
