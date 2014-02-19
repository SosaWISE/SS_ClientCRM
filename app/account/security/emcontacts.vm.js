define('src/account/security/emcontacts.vm', [
  'src/dataservice',
  'src/account/security/emcontacteditor.vm',
  'src/account/security/emcontacts.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
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

    //
    // events
    //
    _this.clickAddContact = function() {
      _this.showContactEditor(null, function(model) {
        if (model) {
          _this.gvm.list.push(model);
        }
      });
    };
    _this.clickReorderContacts = function() {
      alert('@TODO: reorder contacts');
    };

    _this.gvm = new EmContactsGridViewModel({
      edit: function(contact, cb) {
        _this.showContactEditor(contact, cb);
      },
    });
  }
  utils.inherits(EmContactsViewModel, ControllerViewModel);
  EmContactsViewModel.prototype.viewTmpl = 'tmpl-security-emcontacts';

  EmContactsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountId = routeData.id;

    load_contacts(_this, _this.accountId, join.add());
    load_phoneOptions(_this, join.add());
    load_relationshipOptions(_this, join.add());
  };
  EmContactsViewModel.prototype.showContactEditor = function(contact, cb) {
    var _this = this;
    _this.layersVm.show(new EmContactEditorViewModel({
      item: utils.clone(contact),
      // customerId: 0, //????
      accountId: _this.accountId, //????
      orderNumber: _this.gvm.nextOrderNumber(),
      phoneOptions: _this.phoneOptions,
      phoneOptionFields: {
        value: 'PhoneTypeID',
        text: 'PhoneTypeDescription',
      },
      relationshipOptions: _this.relationshipOptions,
      relationshipOptionFields: {
        value: 'RelationshipID',
        text: 'RelationshipDescription',
      },
    }), cb);
  };

  function load_contacts(_this, accountId, cb) {
    dataservice.monitoringstation.accounts.read({
      id: accountId,
      link: 'emergencyContacts',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        _this.gvm.list(resp.Value);
        cb();
      });
    });
  }

  function load_phoneOptions(_this, cb) {
    _this.phoneOptions = null;
    dataservice.monitoringstation.emergencyContactPhoneTypes.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        _this.phoneOptions = resp.Value;
      }, cb);
    });
  }

  function load_relationshipOptions(_this, cb) {
    _this.relationshipOptions = null;
    dataservice.monitoringstation.emergencyContactRelationships.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        _this.relationshipOptions = resp.Value;
      }, cb);
    });
  }


  return EmContactsViewModel;
});
