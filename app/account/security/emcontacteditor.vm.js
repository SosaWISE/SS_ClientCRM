define('src/account/security/emcontacteditor.vm', [
  'src/core/vm.combo',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.base',
  'ko',
  'src/ukov',
], function(
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

    Prefix: {
      converter: strConverter,
    },
    FirstName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('First name is required'),
      ],
    },
    MiddleInitial: {
      converter: strConverter,
    },
    LastName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Last name is required'),
      ],
    },
    Suffix: {
      converter: strConverter,
    },

    Relastionship: {

    },

    Email: {
      converter: strConverter,
      validators: [
        ukov.validators.isEmail(),
      ],
    },

    HouseKeys: {

    },

    PrimaryPhone: {
      converter: phoneConverter,
    },
    PrimaryPhoneTypeId: {

    },
    SecondaryPhone: {
      converter: phoneConverter,
    },
    SecondaryPhoneTypeId: {

    },
    AlternatePhone: {
      converter: phoneConverter,
    },
    AlternatePhoneTypeId: {

    },
  };


  function EmContactEditorViewModel(options) {
    var _this = this;
    EmContactEditorViewModel.super_.call(_this, options);

    _this.width = ko.observable(550);
    _this.height = ko.observable('auto');

    _this.data = ukov.wrap({
      Prefix: '',
      FirstName: '',
      MiddleInitial: '',
      LastName: '',
      Suffix: '',
      Relastionship: null,
      Email: '',
      HouseKeys: false,
      PrimaryPhone: '',
      PrimaryPhoneTypeId: null,
      SecondaryPhone: '',
      SecondaryPhoneTypeId: null,
      AlternatePhone: '',
      AlternatePhoneTypeId: null,
    }, schema);

    _this.data.RelastionshipCvm = new ComboViewModel({
      selectedValue: _this.data.Relastionship,
      list: _this.relastionshipOptions,
    });
    _this.data.HouseKeysCvm = new ComboViewModel({
      selectedValue: _this.data.HouseKeys,
      list: _this.houseKeysOptions,
    });

    _this.data.PrimaryPhoneTypeCvm = new ComboViewModel({
      selectedValue: _this.data.PrimaryPhoneTypeId,
      list: _this.phoneOptions,
      nullable: true,
    });
    _this.data.SecondaryPhoneTypeCvm = new ComboViewModel({
      selectedValue: _this.data.SecondaryPhoneTypeId,
      list: _this.phoneOptions,
      nullable: true,
    });
    _this.data.AlternatePhoneTypeCvm = new ComboViewModel({
      selectedValue: _this.data.AlternatePhoneTypeId,
      list: _this.phoneOptions,
      nullable: true,
    });

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.layer) {
        _this.layer.close(null);
      }
    };
    _this.clickSave = function() {
      if (_this.layer) {
        var model = _this.data.getValue();
        alert('@TODO: add contact:' + JSON.stringify(model));
        _this.layer.close(model);
      }
    };
  }
  utils.inherits(EmContactEditorViewModel, BaseViewModel);
  EmContactEditorViewModel.prototype.viewTmpl = 'tmpl-security-emcontacteditor';


  //@TODO: load options from server
  EmContactEditorViewModel.prototype.phoneOptions = [
    {
      value: 1,
      text: 'Home'
    },
    {
      value: 2,
      text: 'Cellular'
    },
  ];
  EmContactEditorViewModel.prototype.houseKeysOptions = [
    {
      value: true,
      text: 'Yes'
    },
    {
      value: false,
      text: 'No'
    },
  ];
  EmContactEditorViewModel.prototype.relastionshipOptions = [
    {
      value: 1,
      text: 'Relative'
    },
    {
      value: 2,
      text: 'Spouse'
    },
  ];

  return EmContactEditorViewModel;
});
