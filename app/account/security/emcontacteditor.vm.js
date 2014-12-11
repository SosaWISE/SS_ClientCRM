define('src/account/security/emcontacteditor.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  strings,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema, allPhones,
    strConverter = ukov.converters.string(),
    phoneConverter = ukov.converters.phone(),
    phone2ValidationGroup, phone3ValidationGroup;

  function createPhoneAndTypeValidationGroup(phoneName, typeName) {
    return {
      keys: [phoneName, typeName],
      validators: [ //
        function(group) {
          var errName, errMsgObj,
            phone = group[phoneName],
            type = group[typeName];
          if (!phone && type) {
            // type is set but phone is not
            errName = phoneName;
          } else if (phone && !type) {
            // phone is set but type is not
            errName = typeName;
          } else {
            // no errors
            return null;
          }

          errMsgObj = {};
          errMsgObj[errName] = 'Both phone and type must be set.';
          return errMsgObj;
        },
      ],
    };
  }
  phone2ValidationGroup = createPhoneAndTypeValidationGroup('Phone2', 'Phone2TypeId');
  phone3ValidationGroup = createPhoneAndTypeValidationGroup('Phone3', 'Phone3TypeId');

  function uniquePhoneValidator(val, model, ukovModel, prop) {
    if (!val) {
      return;
    }

    var errMsg, dependents = prop.doc.dependents;
    dependents.some(function(key) {
      if (val === ukovModel[key].getValue()) {
        errMsg = 'Duplicate Phone# ' + strings.formatters.phone(val);
        return true;
      }
    });
    return errMsg;
  }

  schema = {
    _model: true,

    EmergencyContactID: {},

    CustomerId: {},
    AccountId: {},

    Prefix: {
      converter: strConverter,
    },
    FirstName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('First name is required'),
      ],
    },
    MiddleName: {
      converter: strConverter,
    },
    LastName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Last name is required'),
      ],
    },
    Postfix: {
      converter: strConverter,
    },

    RelationshipId: {
      validators: [
        ukov.validators.isRequired('Relationship is required'),
      ],
    },
    OrderNumber: {
      validators: [
        ukov.validators.isRequired('OrderNumber is required'),
      ],
    },

    Email: {
      converter: strConverter,
      validators: [
        ukov.validators.isEmail(),
      ],
    },

    HasKey: {},

    Phone1: {
      converter: phoneConverter,
      dependents: ['Phone2', 'Phone3'],
      validators: [
        ukov.validators.isRequired('Primary phone is required'),
        uniquePhoneValidator,
      ],
    },
    Phone1TypeId: {
      validators: [
        ukov.validators.isRequired('Primary phone type is required'),
      ],
    },
    Phone2: {
      converter: phoneConverter,
      dependents: ['Phone1', 'Phone3'],
      validators: [uniquePhoneValidator],
      validationGroup: phone2ValidationGroup,
    },
    Phone2TypeId: {
      validationGroup: phone2ValidationGroup,
    },
    Phone3: {
      converter: phoneConverter,
      dependents: ['Phone1', 'Phone2'],
      validators: [uniquePhoneValidator],
      validationGroup: phone3ValidationGroup,
    },
    Phone3TypeId: {
      validationGroup: phone3ValidationGroup,
    },
  };
  allPhones = [schema.Phone1, schema.Phone2, schema.Phone3];


  function EmContactEditorViewModel(options) {
    var _this = this;
    EmContactEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      // 'customerId',
      'accountId',
      'phoneTypes',
      'phoneTypeFields',
      'relationshipTypes',
      'relationshipTypeFields',
    ]);

    _this.width = ko.observable(550);
    _this.height = ko.observable('auto');

    _this.item = _this.item || {
      // EmergencyContactID: '',
      CustomerId: _this.customerId,
      AccountId: _this.accountId,
      RelationshipId: null,
      OrderNumber: _this.orderNumber || 999,
      Allergies: '',
      MedicalConditions: '',
      HasKey: false,
      DOB: '',
      Prefix: '',
      FirstName: '',
      MiddleName: '',
      LastName: '',
      Postfix: '',
      Email: '',
      Password: '',
      Phone1: '',
      Phone1TypeId: null,
      Phone2: '',
      Phone2TypeId: null,
      Phone3: '',
      Phone3TypeId: null,
      Comment1: '',
    };
    _this.data = ukov.wrap(utils.clone(_this.item), schema);

    _this.data.ContactTypeCvm = new ComboViewModel({
      selectedValue: _this.data.RelationshipId,
      list: _this.relationshipTypes,
      fields: _this.relationshipTypeFields,
    });
    _this.data.AuthorityCvm = new ComboViewModel({
      selectedValue: _this.data.RelationshipId,
      list: _this.relationshipTypes,
      fields: _this.relationshipTypeFields,
    });
    _this.data.RelationshipCvm = new ComboViewModel({
      selectedValue: _this.data.RelationshipId,
      list: _this.relationshipTypes,
      fields: _this.relationshipTypeFields,
    });
    _this.data.HasKeyCvm = new ComboViewModel({
      selectedValue: _this.data.HasKey,
      list: _this.yesNoOptions,
    });

    _this.data.Phone1TypeCvm = new ComboViewModel({
      selectedValue: _this.data.Phone1TypeId,
      list: _this.phoneTypes,
      fields: _this.phoneTypeFields,
      nullable: true,
    });
    _this.data.Phone2TypeCvm = new ComboViewModel({
      selectedValue: _this.data.Phone2TypeId,
      list: _this.phoneTypes,
      fields: _this.phoneTypeFields,
      nullable: true,
    });
    _this.data.Phone3TypeCvm = new ComboViewModel({
      selectedValue: _this.data.Phone3TypeId,
      list: _this.phoneTypes,
      fields: _this.phoneTypeFields,
      nullable: true,
    });

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      _this.isDeleted = false;
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      dataservice.msaccountsetupsrv.emergencyContacts.save({
        id: model.EmergencyContactID,
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        notify.info('Saved ' + formatFullname(model), '', 3);
        if (resp.Message && resp.Message !== 'Success') {
          notify.error(resp, 3);
        }
        //
        _this.data.markClean(model, true);
        //
        _this.layerResult = resp.Value;
        _this.isDeleted = false;
        closeLayer(_this);
      }, function(err) {
        notify.error(err);
      }));
    }, function(busy) {
      return !busy && !_this.cmdDelete.busy();
    });
    _this.cmdDelete = ko.command(function(cb) {
      notify.confirm('Delete?', 'Are you sure you want to delete this emergency contact?', function(result) {
        if (result !== 'yes') {
          cb();
          return;
        }
        var model = _this.data.getValue();
        dataservice.msaccountsetupsrv.emergencyContacts.del(_this.item.EmergencyContactID, null, utils.safeCallback(cb, function(err, resp) {
          notify.info('Deleted ' + formatFullname(model), '', 3);
          if (resp.Message && resp.Message !== 'Success') {
            notify.error(resp, 3);
          }
          //
          _this.layerResult = resp.Value;
          _this.isDeleted = true;
          closeLayer(_this);
        }, function(err) {
          notify.error(err);
        }));
      });
    }, function(busy) {
      return !busy && _this.item.EmergencyContactID && !_this.cmdSave.busy();
    });
  }
  utils.inherits(EmContactEditorViewModel, BaseViewModel);
  EmContactEditorViewModel.prototype.viewTmpl = 'tmpl-security-emcontacteditor';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  EmContactEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, _this.isDeleted];
  };
  EmContactEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = 'Please wait for save to finish.';
    } else if (_this.cmdDelete.busy() && !_this.layerResult) {
      msg = 'Please wait for delete to finish.';
    }
    return msg;
  };

  function formatFullname(d) {
    return strings.joinTrimmed(' ', d.Prefix, d.FirstName, d.MiddleName, d.LastName, d.Postfix);
  }

  return EmContactEditorViewModel;
});
