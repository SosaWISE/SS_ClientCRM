define('mock/dataservices/swingaccountsrv.mock', [
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

    dataservice.swingaccountsrv.CustomerSwingPremiseAddress.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = mockery.fromTemplate({
            StreetAddress1: ' @ADDRESS',
            StreetAddress2: '#@NUMBER(10,300,apt)',
            City: '@CITY',
            County: '@COUNTY',
            PostalCode: '@ZIP',
            State: '@STATEAB',
          });
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.swingaccountsrv.CustomerSwingEmergencyContact.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = mockery.fromTemplate({
            'list|1-5': [ //
              {
                FirstName: '@NAME',
                MiddleInit: '@CHAR_UPPER.',
                LastName: '@LASTNAME',
                Relationship: '@REL_DESC',
                PhoneNumber1: '@PHONE',
              },
            ]
          }).list;
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.swingaccountsrv.CustomerSwingSystemDetails.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = mockery.fromTemplate({
            ServiceType: 'ServiceType',
            CellularType: 'CellularType',
            PassPhrase: 'PassPhrase',
            PanelType: 'PanelType',
            DslSeizure: 'DslSeizure',
          });
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.swingaccountsrv.CustomerSwingEquipmentInfo.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = mockery.fromTemplate({
            'list|4-5': [ //
              {
                ZoneTypeName: 'ZoneTypeName',
                FullName: 'FullName',
                EquipmentLocationDesc: 'EquipmentLocationDesc',
              },
            ]
          }).list;
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.swingaccountsrv.CustomerSwungInfo.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          if (id === 100000) {
            result = mockery.fromTemplate({
              MsAccountID: id,
              CustomerMasterFileID: 3020200,
            });
          }
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.swingaccountsrv.CustomerSwingAddDnc.read = function(params, setter, cb) {
      send('use save instead of read to modify data', null, setter, cb);
    };

    dataservice.swingaccountsrv.CustomerSwingInterim.post = function(path, swingParam, setter, cb) {
      var result;

      // data = {
      //   InterimAccountId: AccountID,
      //   SwingEquipment: bool,
      // };

      send(1, result, setter, cb);
    };
    dataservice.swingaccountsrv.CustomerSwingInfo.post = function(path, swingParam, setter, cb) {
      // swingParam= {
      //   InterimAccountId: AccountID,
      //   CustomerType: "PRI"
      // }

      var result;

      result = mockery.fromTemplate({
        Prefix: '@CHAR_UPPER(pre)@CHAR_LOWER(pre).',
        FirstName: '@NAME',
        MiddleName: '@CHAR_UPPER',
        LastName: '@LASTNAME',
        Suffix: '@CHAR_UPPER(post)@CHAR_LOWER(post).',
        SSN: '@NUMBER(100,999,SSN3)-@NUMBER(10,99,SSN2)-@NUMBER(1000,9999,SSN4)',
        DOB: '@DATE',
        Email: '@EMAIL',
      });

      send(0, result, setter, cb);
      // send('use read instead of post to get data', result, setter, cb);
    };

    // dataservice.asdf.dddddddddd.save = function(params, setter, cb) {
    //   var result, data = params.data,
    //     code = 0;
    //   switch (params.link || null) {
    //     case null:
    //       if (data.AccountId) {
    //         result = mockery.fromTemplate({
    //           AccountSubmitID: '@INC(accountSubmits)',
    //           AccountId: data.AccountId,
    //           GPTechId: '@CHAR_UPPER@CHAR_UPPER@CHAR_UPPER@CHAR_UPPER00@NUMBER(1,9)',
    //           DateSubmitted: '@NOW',
    //           WasSuccessfull: '@BOOL',
    //         });
    //       } else {
    //         code = -1;
    //       }
    //       break;
    //   }
    //   send(code, result, setter, cb);
    // };
  }

  (function() {
    // mockery.addModulusValueFunc('ASDF', [
    //   'Window Film',
    // ]);
  })();

  // // data used in mock function
  // var asdf;

  return mock;
});
