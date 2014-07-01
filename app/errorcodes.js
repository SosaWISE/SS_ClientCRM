define('src/errorcodes', [], function() {
  "use strict";

  return {
    '-1': 'Error',
    '-2': 'Unhandled Exception',

    '0': 'Info',

    '70110': 'Item was not found',
    '70120': 'Duplicate item found',

    '990000': 'Connection Refused',
    '990001': 'Error processing response',
    '990002': 'Request Error',
    '990003': 'Request Timeout Error',
    '990004': 'Error in setter callback',
  };
});
