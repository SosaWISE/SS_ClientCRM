define('mock/dataservices/hr.mock', [
  'src/core/strings',
  'src/dataservice',
  'src/core/mockery',
], function(
  strings,
  dataservice,
  mockery
) {
  "use strict";

  function mock(settings) {
    function send(code, value, setter, cb, timeout) {
      mockery.send(code, value, setter, cb, timeout || settings.timeout);
    }

    dataservice.humanresourcesrv.users.read = function(params, setter, cb) {
      var result,
        id = params.id;
      switch (params.link || null) {
        case null:
          if (id) {
            result = mockery.fromTemplate(getUserTemplate({
              UserID: id
            }));
            // } else if (params.data) {
            //   result = mockery.fromTemplate({
            //     'list|1-10': [getUserTemplate(params.data)]
            //   }).list;
          }
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.humanresourcesrv.users.save = function(params, setter, cb) {
      var result, data = params.data;
      switch (params.link || null) {
        case null:
          result = mockery.fromTemplate(getUserTemplate(data));
          break;
        case 'search':
          result = mockery.fromTemplate({
            'list|1-10': [getUserTemplate(data)]
          }).list;
          break;
      }
      send(0, result, setter, cb);
    };
  }

  (function() {

    mockery.fn.FAKE_COMPANYID = function(cache) {
      return mockery.fromTemplate('@CHAR_LOWER(0)@CHAR_UPPER(1)@CHAR_UPPER(2)@NUMBER(100,109)', null, cache);
    };

  })();

  // data used in mock function
  // var ;

  function getUserTemplate(data) {
    var fname = (data.FirstName || '@NAME'),
      lname = (data.LastName || '@LASTNAME');
    return {
      UserID: (data.UserID || '@INC(users)'),

      FullName: fname + ' ' + lname,
      PublicFullName: fname + ' ' + lname,

      RecruitedByID: (data.RecruitedByID || 1),
      GPEmployeeID: (data.GPEmployeeID || '@FAKE_COMPANYID'),
      UserEmployeeTypeId: (data.UserEmployeeTypeId || 'SALESREP'),
      PermanentAddressID: (data.PermanentAddressID || null),
      PhoneCellCarrierID: (data.PhoneCellCarrierID || null),
      RightToWorkStatusID: (data.RightToWorkStatusID || null),

      SSN: (data.SSN || '123121234'),
      FirstName: (data.FirstName || '@NAME'),
      MiddleName: (data.MiddleName || null),
      LastName: (data.LastName || '@LASTNAME'),
      PreferredName: (data.PreferredName || null),
      CompanyName: (data.CompanyName || null),
      MaritalStatus: (data.MaritalStatus || false),
      SpouseName: (data.SpouseName || null),
      UserName: (data.UserName || strings.format('{0}.{1}', fname, lname)),
      Password: (data.Password || null),
      BirthDate: (data.BirthDate || null),
      HomeTown: (data.HomeTown || null),
      BirthCity: (data.BirthCity || '@CITY'),
      BirthState: (data.BirthState || '@STATEAB'),
      BirthCountry: (data.BirthCountry || null),
      Sex: (data.Sex || 1),
      ShirtSize: (data.ShirtSize || 4),
      HatSize: (data.HatSize || 2),
      DLNumber: (data.DLNumber || null),
      DLState: (data.DLState || null),
      DLCountry: (data.DLCountry || null),
      DLExpiresOn: (data.DLExpiresOn || '@DATE(1000,5000)'),
      Height: (data.Height || null),
      Weight: (data.Weight || null),
      EyeColor: (data.EyeColor || null),
      HairColor: (data.HairColor || null),
      PhoneHome: (data.PhoneHome || null),
      PhoneCell: (data.PhoneCell || '1234567890'),
      PhoneFax: (data.PhoneFax || null),
      Email: (data.Email || strings.format('{0}.{1}@@LASTNAME(cb).com', fname, lname)),
      CorporateEmail: (data.CorporateEmail || null),
      TreeLevel: (data.TreeLevel || null),
      HasVerifiedAddress: (data.HasVerifiedAddress || false),
      RightToWorkExpirationDate: (data.RightToWorkExpirationDate || null),
      RightToWorkNotes: (data.RightToWorkNotes || null),
      IsLocked: (data.IsLocked || false),
      IsActive: (data.IsActive || true),
      IsDeleted: (data.IsDeleted || false),
      RecruitedDate: (data.RecruitedDate || '@DATETIME(-8,-5)'),

      CreatedBy: (data.CreatedBy || 'SYSTEM'),
      CreatedOn: (data.CreatedOn || '@DATETIME(-10,-5)'),
      ModifiedBy: (data.ModifiedBy || 'SYSTEM'),
      ModifiedOn: (data.ModifiedOn || '@DATETIME(-5,-1)'),
    };
  }

  return mock;
});
