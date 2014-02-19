define('src/account/security/emcontacteditor.vm', [
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
    strConverter = ukov.converters.string(),
    phoneConverter = ukov.converters.phone();

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
      validators: [
        ukov.validators.isRequired('Primary phone is required'),
      ],
    },
    Phone1TypeId: {
      validators: [
        ukov.validators.isRequired('Primary phone type is required'),
      ],
    },
    Phone2: {
      converter: phoneConverter,
    },
    Phone2TypeId: {},
    Phone3: {
      converter: phoneConverter,
    },
    Phone3TypeId: {},
  };


  function EmContactEditorViewModel(options) {
    var _this = this;
    EmContactEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      // 'customerId',
      'accountId',
      'phoneOptions',
      'phoneOptionFields',
      'relationshipOptions',
      'relationshipOptionFields',
    ]);

    _this.width = ko.observable(550);
    _this.height = ko.observable('auto');

    _this.data = ukov.wrap(_this.item || {
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
    }, schema);

    _this.data.RelastionshipCvm = new ComboViewModel({
      selectedValue: _this.data.RelationshipId,
      list: _this.relationshipOptions,
      fields: _this.relationshipOptionFields,
    });
    _this.data.HasKeyCvm = new ComboViewModel({
      selectedValue: _this.data.HasKey,
      list: _this.yesNoOptions,
    });

    _this.data.Phone1TypeCvm = new ComboViewModel({
      selectedValue: _this.data.Phone1TypeId,
      list: _this.phoneOptions,
      fields: _this.phoneOptionFields,
      nullable: true,
    });
    _this.data.Phone2TypeCvm = new ComboViewModel({
      selectedValue: _this.data.Phone2TypeId,
      list: _this.phoneOptions,
      fields: _this.phoneOptionFields,
      nullable: true,
    });
    _this.data.Phone3TypeCvm = new ComboViewModel({
      selectedValue: _this.data.Phone3TypeId,
      list: _this.phoneOptions,
      fields: _this.phoneOptionFields,
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
      return !busy && !_this.cmdSave.busy() && !_this.cmdDelete.busy();
    });
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.layer) {
        cb();
        return;
      }
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);
      dataservice.monitoringstation.emergencyContacts.save({
        id: model.EmergencyContactID,
        data: model,
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
        }
        utils.safeCallback(err, function() {
          _this.layer.close(resp.Value, false);
        }, cb);
      });
    }, function(busy) {
      return !busy && !_this.cmdDelete.busy();
    });
    _this.cmdDelete = ko.command(function(cb) {
      if (!_this.layer) {
        cb();
        return;
      }
      dataservice.monitoringstation.emergencyContacts.del(_this.data.model.EmergencyContactID, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
        }
        utils.safeCallback(err, function() {
          _this.layer.close(resp.Value, true);
        }, cb);
      });
    }, function(busy) {
      return !busy && _this.item && !_this.cmdSave.busy();
    });
  }
  utils.inherits(EmContactEditorViewModel, BaseViewModel);
  EmContactEditorViewModel.prototype.viewTmpl = 'tmpl-security-emcontacteditor';

  return EmContactEditorViewModel;
});
