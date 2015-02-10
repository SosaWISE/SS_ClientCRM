define("mock/dataservices/hr.mock", [
  "src/core/strings",
  "src/dataservice",
  "src/core/mockery",
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

    dataservice.hr.phoneCellCarriers.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(phoneCellCarriers, "PhoneCellCarrierID", id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.hr.userEmployeeTypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(userEmployeeTypes, "UserEmployeeTypeID", id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.hr.seasons.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(seasons, "SeasonID", id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.hr.skills.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(skills, "ID", id);
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.hr.users.read = function(params, setter, cb) {
      var result, id = params.id,
        data = {
          UserID: id,
        };
      switch (params.link || null) {
        case null:
          if (id) {
            result = mockery.fromTemplate(getUserTemplate(data));
          }
          break;
        case "recruits":
          result = mockery.fromTemplate({
            "list|1-5": [getRecruitTemplate(data)]
          }).list;
          // result.forEach(function(recruit) {
          //   recruit.Skills = getSkills();
          // });
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.hr.recruits.read = function(params, setter, cb) {
      var result, id = params.id,
        data = {
          RecruitID: id,
        };
      switch (params.link || null) {
        case null:
          if (id) {
            result = mockery.fromTemplate(getRecruitTemplate(data));
          }
          break;
        case "weekSchedule":
          result = getWeekSchedule();
          break;
        case "skills":
          result = getSkills();
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.hr.recruits.save = function(params, setter, cb) {
      var result, data = params.data;
      switch (params.link || null) {
        case null:
          result = mockery.fromTemplate(getRecruitTemplate(data));
          // result.Skills = data.Skills || getSkills();
          break;
        case "weekSchedule":
          result = data || getWeekSchedule();
          break;
        case "skills":
          result = data || getSkills();
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.hr.users.save = function(params, setter, cb) {
      var result, data = params.data;
      switch (params.link || null) {
        case null:
          result = mockery.fromTemplate(getUserTemplate(data));
          break;
        case "search":
          result = mockery.fromTemplate({
            "list|1-10": [getUserTemplate(data)]
          }).list;
          break;
      }
      send(0, result, setter, cb);
    };
  }

  function getUserTemplate(data) {
    var fname = (data.FirstName || "@NAME"),
      lname = (data.LastName || "@LASTNAME");
    return {
      UserID: (data.UserID || "@INC(users)"),

      FullName: fname + " " + lname,
      PublicFullName: fname + " " + lname,

      RecruitedByID: (data.RecruitedByID || 1),
      GPEmployeeID: (data.GPEmployeeID || "@FAKE_COMPANYID"),
      UserEmployeeTypeId: (data.UserEmployeeTypeId || "SALESREP"),
      PermanentAddressID: (data.PermanentAddressID || null),
      PhoneCellCarrierID: (data.PhoneCellCarrierID || null),
      RightToWorkStatusID: (data.RightToWorkStatusID || null),

      SSN: (data.SSN || "123121234"),
      FirstName: (data.FirstName || "@NAME"),
      MiddleName: (data.MiddleName || null),
      LastName: (data.LastName || "@LASTNAME"),
      PreferredName: (data.PreferredName || null),
      CompanyName: (data.CompanyName || null),
      MaritalStatus: (data.MaritalStatus || false),
      SpouseName: (data.SpouseName || null),
      UserName: (data.UserName || strings.format("{0}.{1}", fname, lname)),
      Password: (data.Password || null),
      BirthDate: (data.BirthDate || null),
      HomeTown: (data.HomeTown || null),
      BirthCity: (data.BirthCity || "@CITY"),
      BirthState: (data.BirthState || "@STATEAB"),
      BirthCountry: (data.BirthCountry || null),
      Sex: (data.Sex || 1),
      ShirtSize: (data.ShirtSize || 4),
      HatSize: (data.HatSize || 2),
      DLNumber: (data.DLNumber || null),
      DLState: (data.DLState || null),
      DLCountry: (data.DLCountry || null),
      DLExpiresOn: (data.DLExpiresOn || "@DATE(1000,5000)"),
      Height: (data.Height || null),
      Weight: (data.Weight || null),
      EyeColor: (data.EyeColor || null),
      HairColor: (data.HairColor || null),
      PhoneHome: (data.PhoneHome || null),
      PhoneCell: (data.PhoneCell || "1234567890"),
      PhoneFax: (data.PhoneFax || null),
      Email: (data.Email || strings.format("{0}.{1}@@LASTNAME(cb).com", fname, lname)),
      CorporateEmail: (data.CorporateEmail || null),
      TreeLevel: (data.TreeLevel || null),
      HasVerifiedAddress: (data.HasVerifiedAddress || false),
      RightToWorkExpirationDate: (data.RightToWorkExpirationDate || null),
      RightToWorkNotes: (data.RightToWorkNotes || null),
      IsLocked: (data.IsLocked || false),
      IsActive: (data.IsActive || true),
      IsDeleted: (data.IsDeleted || false),
      RecruitedDate: (data.RecruitedDate || "@DATETIME(-8,-5)"),

      CreatedBy: (data.CreatedBy || "SYSTEM"),
      CreatedOn: (data.CreatedOn || "@DATETIME(-10,-5)"),
      ModifiedBy: (data.ModifiedBy || "SYSTEM"),
      ModifiedOn: (data.ModifiedOn || "@DATETIME(-5,-1)"),
    };
  }

  function getRecruitTemplate(data) {
    return {
      RecruitID: data.RecruitID || "@INC(recruits)",
      UserID: data.UserID || "@FK(users)",
      SeasonID: data.SeasonID || 1,

      UserTypeId: data.UserTypeId || 1 || "@FK(userTypes)",
      ReportsToID: data.ReportsToID || null,
      TeamID: data.TeamID || null,
      PayScaleID: data.PayScaleID || null,
      PreviousSummer: data.PreviousSummer || "PreviousSummer",
      SignatureDate: data.SignatureDate || "@DATETIME(-8,-5)",
      ManagerApprovalDate: data.ManagerApprovalDate || "@DATETIME(-8,-5)",
      OwnerApprovalDate: data.OwnerApprovalDate || "@DATETIME(-8,-5)",
      OwnerApprovalId: data.OwnerApprovalId || null,
      SchoolId: data.SchoolId || null,

      DriversLicenseStatusID: data.DriversLicenseStatusID || 1,
      DriversLicenseNotes: data.DriversLicenseNotes || "DriversLicenseNotes",
      I9StatusID: data.I9StatusID || 1,
      I9Notes: data.I9Notes || "I9Notes",
      W9StatusID: data.W9StatusID || 1,
      W9Notes: data.W9Notes || "W9Notes",
      W4StatusID: data.W4StatusID || 1,
      W4Notes: data.W4Notes || "W4Notes",

      EmergencyName: data.EmergencyName || "EmergencyName",
      EmergencyRelationship: data.EmergencyRelationship || "EmergencyRelationship",
      EmergencyPhone: data.EmergencyPhone || "@PHONE",

      CountryId: data.CountryId || "USA",
      StreetAddress: data.StreetAddress || "StreetAddress",
      City: data.City || "@CITY",
      StateId: data.StateId || "@STATEAB",
      PostalCode: data.PostalCode || "@ZIP",

      RecruitCohabbitTypeId: data.RecruitCohabbitTypeId || null,
      ShackingUpId: data.ShackingUpId || null,
      Rent: data.Rent || 1.11,
      Pet: data.Pet || 2.22,
      Utilities: data.Utilities || 3.33,
      Fuel: data.Fuel || 4.44,

      // EIN: "", //                       [nvarchar](50)
      // FedFilingStatus: "", //           [nvarchar](50)
      // SUTA: "", //                      [nvarchar](50)
      // EICFilingStatus: "", //           [nvarchar](50)
      // WorkersComp: "", //               [nvarchar](max)
      // StateFilingStatus: "", //         [nvarchar](50)
      // TaxWitholdingState: "", //        [nvarchar](5)
      // GPDependents: "", //              [int]

      DealerId: data.DealerId || 5000,
      IsActive: data.IsActive || true,
      IsDeleted: data.IsDeleted || false,
      CreatedBy: data.CreatedBy || "SYSTEM",
      CreatedOn: data.CreatedOn || "@DATETIME(-10,-5)",
      ModifiedBy: data.ModifiedBy || "SYSTEM",
      ModifiedOn: data.ModifiedOn || "@DATETIME(-5,-1)",
    };
  }

  function getWeekSchedule() {
    return mockery.fromTemplate({
      "list|3-7": [ //
        {
          DayId: "@NUMBER(0,7)",
          StartTime: new Date(1970, 0, 1, 6),
          EndTime: new Date(1970, 0, 1, 17),
        },
      ],
    }).list;
  }

  function getSkills() {
    return mockery.fromTemplate({
      "list|1-5": [ //
        {
          SkillId: "@FK(skills)",
          OtherText: null,
        },
      ],
    }).list;
  }

  (function() {

    mockery.fn.FAKE_COMPANYID = function(cache) {
      return mockery.fromTemplate("@CHAR_LOWER(0)@CHAR_UPPER(1)@CHAR_UPPER(2)@NUMBER(100,109)", null, cache);
    };

    mockery.addModulusValueFunc("USER_EMP_TYPE_ID", [
      "CONT",
      "CORP",
      "DEFAULT",
      "SALESREP",
      "SUBCONT",
      "TECHNCN",
      "VENDOR",
    ]);
    mockery.addModulusValueFunc("USER_EMP_TYPE_NAME", [
      "Contractor",
      "Corporate",
      "Default",
      "Sales Rep",
      "Sub Contractor",
      "Technician",
      "Vendor",
    ]);

    mockery.addModulusValueFunc("CELLCARRIER", ["Verizon", "TMobile", "Sprint", "CricKet"]);

    mockery.addModulusValueFunc("RECRUIT_SEASON", [
      "Interim Swing Account Season",
      "Year Round Tech",
      "Inside Sales Group 1",
      "Extended Season Test",
      "Pre Season Test",
    ]);

    mockery.addModulusValueFunc("SKILL", [
      "2GIG Programming",
      "2GIG Security",
      "2GIG Thermostat",
      "Z-Wave Deadbolts",
      "GE Programming",
      "GE Sensors",
      "HY Programming",
      "HY Sensors",
      "TG Cameras",
      "ADC Cameras",
      "Z-Wave Lighting",
      "Door Armor",
    ]);
    mockery.addModulusValueFunc("SKILL_PANEL", [
      "2GIG",
      "Concord",
      "Lynx",
      "Simon",
      "Vista",
    ]);
    mockery.addModulusValueFunc("SKILL_PANEL_ID", [
      "2GIG",
      "CONCORD",
      "LYNX",
      "SIMON",
      "VISTA",
    ]);
  })();

  // data used in mock function
  var phoneCellCarriers,
    userEmployeeTypes,
    seasons,
    skills;

  phoneCellCarriers = mockery.fromTemplate({
    "list|4-4": [ //
      {
        PhoneCellCarrierID: "@INC(phoneCellCarriers)",
        Description: "@CELLCARRIER",
      },
    ],
  }).list;
  userEmployeeTypes = mockery.fromTemplate({
    "list|7-7": [ //
      {
        UserEmployeeTypeID: "@USER_EMP_TYPE_ID",
        UserEmployeeTypeName: "@USER_EMP_TYPE_NAME",
      },
    ],
  }).list;
  seasons = mockery.fromTemplate({
    "list|5-5": [ //
      {
        SeasonID: "@INC(seasons)",
        SeasonName: "@RECRUIT_SEASON",
      },
    ],
  }).list;

  skills = mockery.fromTemplate({
    "list|12-12": [ //
      {
        ID: "@INC(skills)",
        Name: "@SKILL",
        PanelTypeId: null,
      },
    ],
  }).list.concat(mockery.fromTemplate({
    "list|5-5": [ //
      {
        ID: "@INC(skills)",
        Name: "@SKILL_PANEL",
        PanelTypeId: "@SKILL_PANEL_ID",
      },
    ],
  }).list).concat(mockery.fromTemplate({
    "list|1-1": [ //
      {
        ID: "@INC(skills)",
        Name: "Other",
        PanelTypeId: "OTHER",
      },
    ],
  }).list);


  return mock;
});
