define('mock/dataservices/monitoringstationsrv.mock', [
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

    dataservice.monitoringstationsrv.msAccounts.save = function(params, setter, cb) {
      var result, data = params.data,
        code = 0;
      switch (params.link || null) {
        case null:
          if (data.AccountId) {
            result = mockery.fromTemplate({
              AccountSubmitID: '@INC(accountSubmits)',
              AccountId: data.AccountId,
              GPTechId: '@CHAR_UPPER@CHAR_UPPER@CHAR_UPPER@CHAR_UPPER00@NUMBER(1,9)',
              DateSubmitted: '@NOW',
              WasSuccessfull: '@BOOL',
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
    // mockery.addModulusValueFunc('ASDF', [
    //   'Window Film',
    // ]);
  })();

  // // data used in mock function
  // var asdf;

  return mock;
});
