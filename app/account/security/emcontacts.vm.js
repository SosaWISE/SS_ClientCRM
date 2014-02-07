define('src/account/security/emcontacts.vm', [
  'src/account/security/emcontacteditor.vm',
  'src/account/security/emcontacts.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  EmContactEditorViewModel,
  EmContactsGridViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function EmContactsViewModel(options) {
    var _this = this;
    EmContactsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.gvm = new EmContactsGridViewModel();

    //
    // events
    //
    _this.clickAddContact = function() {
      _this.layersVm.show(new EmContactEditorViewModel(), function(model) {
        if (!model) {
          return;
        }
        _this.gvm.list.push(model);
      });
    };
    _this.clickEditContact = function() {
      alert('@TODO: edit contact');
    };
    _this.clickDeleteContact = function() {
      alert('@TODO: delete contact');
    };
    _this.clickReorderContacts = function() {
      alert('@TODO: reorder contacts');
    };
  }
  utils.inherits(EmContactsViewModel, ControllerViewModel);
  EmContactsViewModel.prototype.viewTmpl = 'tmpl-security-emcontacts';

  EmContactsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };

  return EmContactsViewModel;
});
