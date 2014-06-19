define('src/account/security/emcontacts.vm', [
  'ko',
  'src/dataservice',
  'src/account/security/emcontacteditor.vm',
  'src/account/security/emcontacts.gvm',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  dataservice,
  EmContactEditorViewModel,
  EmContactsGridViewModel,
  strings,
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
    _this.cmdAddContact = ko.command(function(cb) {
      _this.showContactEditor(null, function(model) {
        if (model) {
          _this.gvm.list.push(model);
        }
        cb();
      });
    });

    _this.gvm = new EmContactsGridViewModel({
      edit: function(contact, cb) {
        _this.showContactEditor(contact, cb);
      },
      save: function(model) {
        dataservice.msaccountsetupsrv.emergencyContacts.save({
          id: model.EmergencyContactID,
          data: model,
        }, null, utils.safeCallback(null, function(err, resp) {
          notify.info('Saved ' + formatFullname(model), '', 3);
          if (resp.Message && resp.Message !== 'Success') {
            notify.error(resp, 3);
          }
        }, function(err) {
          notify.error(err);
        }));
      },
      fullnameFormatter: function(row, cell, value, columnDef, dataCtx) {
        return formatFullname(dataCtx);
      },
      relationshipFormatter: function(row, cell, value) {
        var relationship = findById(_this.relationshipTypes, value, 'RelationshipID');
        return relationship ? relationship.RelationshipDescription : 'Unknown Relationship';
      },
      getPhoneType: function(phoneTypeId) {
        var result;
        _this.phoneTypes.some(function(phoneType) {
          if (phoneType.PhoneTypeID === phoneTypeId) {
            result = phoneType;
            return true;
          }
        });
        return result;
      }
    });
  }
  utils.inherits(EmContactsViewModel, ControllerViewModel);
  EmContactsViewModel.prototype.viewTmpl = 'tmpl-security-emcontacts';

  EmContactsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      tempContacts;

    _this.accountId = routeData.id;

    load_phoneTypes(_this, join.add());
    load_relationshipTypes(_this, join.add());
    load_contacts(function(list) {
      tempContacts = list;
    }, _this.accountId, join.add());

    _this.gvm.list([]); // incase of reload
    join.when(function(err) {
      if (err) {
        return;
      }
      _this.gvm.list(tempContacts);
    });
  };
  EmContactsViewModel.prototype.showContactEditor = function(contact, cb) {
    var _this = this;
    _this.layersVm.show(new EmContactEditorViewModel({
      item: utils.clone(contact),
      // customerId: 0, //????
      accountId: _this.accountId,
      orderNumber: _this.gvm.nextOrderNumber(),
      phoneTypes: _this.phoneTypes,
      phoneTypeFields: {
        value: 'PhoneTypeID',
        text: 'PhoneTypeDescription',
      },
      relationshipTypes: _this.relationshipTypes,
      relationshipTypeFields: {
        value: 'RelationshipID',
        text: 'RelationshipDescription',
      },
    }), cb);
  };

  function load_contacts(setter, accountId, cb) {
    dataservice.msaccountsetupsrv.accounts.read({
      id: accountId,
      link: 'emergencyContacts',
    }, null, utils.safeCallback(cb, function(err, resp) {
      // sort emergency contacts
      resp.Value.sort(function(a, b) {
        return a.OrderNumber - b.OrderNumber;
      });
      setter(resp.Value);
    }, utils.no_op));
  }

  function load_phoneTypes(_this, cb) {
    _this.phoneTypes = null;
    dataservice.msaccountsetupsrv.emergencyContactPhoneTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      _this.phoneTypes = resp.Value;
    }, utils.no_op));
  }

  function load_relationshipTypes(_this, cb) {
    _this.relationshipTypes = null;
    dataservice.msaccountsetupsrv.emergencyContactRelationships.read({}, null, utils.safeCallback(cb, function(err, resp) {
      _this.relationshipTypes = resp.Value;
    }, utils.no_op));
  }

  function findById(list, id, idName) {
    var result;
    list.some(function(item) {
      if (item[idName] === id) {
        result = item;
        return true;
      }
    });
    return result;
  }


  function formatFullname(d) {
    return strings.joinTrimmed(' ', d.Prefix, d.FirstName, d.MiddleName, d.LastName, d.Postfix);
  }


  return EmContactsViewModel;
});
