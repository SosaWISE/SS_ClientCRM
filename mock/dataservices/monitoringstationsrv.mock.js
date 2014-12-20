define("mock/dataservices/monitoringstationsrv.mock", [
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

    dataservice.monitoringstationsrv.msAccounts.read = function(params, setter, cb) {
      var result, template, days;
      switch (params.link || null) {
        case null:
        case "signalhistory":
          // one per day??
          days = params.query.days;

          template = {};
          template["list|" + days + "-" + days] = [ //
            {
              HistoryDate: "@DATETIME(-" + days + ",0)",
              UTCDate: "@DATETIME(-" + days + ",0)",
              TransmitterCode: "TransmitterCode",
              SiteName: "SiteName",
              EventCode: "EventCode",
              EventCodeDescription: "EventCodeDescription",
              OpAct: "OpAct",
              OpActDescription: "OpActDescription",
              SignalCode: "SignalCode",
              Point: "Point",
              PointDescription: "PointDescription",
              Comment: "Comment",
              AlarmNum: "AlarmNum",
              AreaNum: "00@ONE_TO_NINE",
              TestNum: "TestNum",
              RawMessage: "RawMessage",
              Phone: "Phone",
              FullClearFlag: "FullClearFlag",
              UserId: "UserId",
              UserName: "UserName",
              Latitude: "Latitude",
              Longitude: "Longitude",
            },
          ];
          result = mockery.fromTemplate(template).list;
          break;
        case "DispatchAgencyAssignments":
          result = mockery.fromTemplate({
            "list|3-5": [ //
              {
                DispatchAgencyAssignmentID: "DispatchAgencyAssignmentID",
                DispatchAgencyId: "DispatchAgencyId",
                DispatchAgencyTypeId: "DispatchAgencyTypeId",
                DispatchAgencyTypeName: "DispatchAgencyTypeName",
                AccountId: "AccountId",
                IndustryAccountID: "IndustryAccountID",
                CsNo: "CsNo",
                DispatchAgencyName: "DispatchAgencyName",
                Phone1: "Phone1",
                PermitNumber: "PermitNumber",

                PermitEffectiveDate: "@DATETIME(-10,-5)",
                PermitExpireDate: "@DATETIME(30,60)",
                IsVerified: true,
                IsActive: true,
              },
            ],
          }).list;
          break;
        default:
          throw new Error("invalid link: " + params.link);
      }
      send(0, result, setter, cb);
    };

    dataservice.monitoringstationsrv.msAccounts.save = function(params, setter, cb) {
      var result, data = params.data,
        code = 0;
      switch (params.link || null) {
        case null:
          if (data.AccountId) {
            result = mockery.fromTemplate({
              AccountSubmitID: "@INC(accountSubmits)",
              AccountId: data.AccountId,
              GPTechId: "@CHAR_UPPER@CHAR_UPPER@CHAR_UPPER@CHAR_UPPER00@NUMBER(1,9)",
              DateSubmitted: "@NOW",
              WasSuccessfull: "@BOOL",
            });
          } else {
            code = -1;
          }
          break;
      }
      send(code, result, setter, cb);
    };
  }

  (function() {
    // mockery.addModulusValueFunc("ASDF", [
    //   "Window Film",
    // ]);
  })();

  // // data used in mock function
  // var asdf;

  return mock;
});
