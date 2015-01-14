define('src/crm/errorcodes', [], function() {
  "use strict";

  return {
    '-1': 'Error',
    '-2': 'Unhandled Exception',

    '0': 'Info',

    '60100': 'Unverified Address',

    '70110': 'Item was not found',
    '70120': 'Duplicate item found',
    '70130': 'Null exception occurred',
    '70140': 'Argument Validation Failed',
    '70150': 'Invalid Equipment Move',

    '80200': 'Signal History not Found',

    '90300': 'Monitronics Dispatch Agency Not Found in Their System',

    '990000': 'Connection Refused',
    '990001': 'Error processing response',
    '990002': 'Request Error',
    '990003': 'Request Timeout Error',
    '990004': 'Error in setter callback',

  };
});
