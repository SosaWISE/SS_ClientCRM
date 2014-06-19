define('src/errorcodes', [], function() {
  "use strict";

  return {
    '-1': 'Error (code unspecific -1)',
    '-2': 'Unhandled Error',

    '0': 'Success!!',

    '990000': 'Connection Refused',
    '990001': 'Error processing response',
    '990002': 'Request Error',
    '990003': 'Request Timeout Error',
  };
});
