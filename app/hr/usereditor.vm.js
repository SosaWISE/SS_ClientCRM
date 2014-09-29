define('src/hr/usereditor.vm', [
  'src/account/default/address.validate.vm',
  'src/core/combo.vm',
  'src/dataservice',
  'src/hr/search.gvm',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  AddressValidateViewModel,
  ComboViewModel,
  dataservice,
  SearchGridViewModel,
  ukov,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var schema;

  schema = {
    _model: true,

    UserID: {},
    FullName: {},
    PublicFullName: {},
    RecruitedByID: {},
    GPEmployeeID: {},
    UserEmployeeTypeId: {},
    PermanentAddressID: {},
    SSN: {},
    FirstName: {},
    MiddleName: {},
    LastName: {},
    PreferredName: {},
    CompanyName: {},
    MaritalStatus: {},
    SpouseName: {},
    UserName: {},
    Password: {},
    BirthDate: {},
    HomeTown: {},
    BirthCity: {},
    BirthState: {},
    BirthCountry: {},
    Sex: {},
    ShirtSize: {},
    HatSize: {},
    DLNumber: {},
    DLState: {},
    DLCountry: {},
    DLExpiration: {},
    Height: {},
    Weight: {},
    EyeColor: {},
    HairColor: {},
    PhoneHome: {},
    PhoneCell: {},
    PhoneCellCarrierID: {},
    PhoneFax: {},
    Email: {},
    CorporateEmail: {},
    TreeLevel: {},
    HasVerifiedAddress: {},
    RightToWorkExpirationDate: {},
    RightToWorkNotes: {},
    RightToWorkStatusID: {},
    IsLocked: {},
    IsActive: {},
    IsDeleted: {},
    RecruitedDate: {},
    CreatedBy: {},
    CreatedOn: {},
    ModifiedBy: {},
    ModifiedOn: {},
  };

  // ctor
  function UserEditoryViewModel(options) {
    var _this = this;
    UserEditoryViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({}, schema);

    //
    // events
    //

    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(UserEditoryViewModel, ControllerViewModel);
  UserEditoryViewModel.prototype.viewTmpl = 'tmpl-hr-usereditor';

  return UserEditoryViewModel;
});
