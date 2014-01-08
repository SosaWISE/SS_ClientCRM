define('mock/dataservice.accountingengine.mock', [
  'src/dataservice',
  'src/core/mockery',
], function(
  dataservice,
  mockery
) {
  "use strict";

  function mock(settings) {
    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function send(value, setter, cb, timeout) {
      var err, result;
      if (value) {
        value = clone(value);
      }
      if (false && !value) {
        err = {
          Code: 12345,
          Message: 'No value',
          Value: null,
        };
      } else {
        result = {
          Code: 0,
          Message: 'Success',
          Value: value,
        };
      }

      setTimeout(function() {
        if (!err && result && typeof(setter) === 'function') {
          setter(result.Value);
        }
        cb(err, result);
      }, timeout || settings.timeout);
    }

    function filterListBy(list, propName, id) {
      return list.filter(function(item) {
        return item[propName] === id;
      });
    }

    function findSingleBy(list, propName, id) {
      return list.filter(function(item) {
        return item[propName] === id;
      })[0];
    }

    function findSingleOrAll(list, propName, id) {
      var result;
      if (id > 0) {
        result = findSingleBy(list, propName, id);
      } else {
        result = list;
      }
      return result;
    }

    dataservice.accountingengine.aging.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = filterListBy(agings, 'CMFID', id);
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.billingInfoSummary.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(billingInfoSummarys, 'SummaryID', id);
          break;
        case 'CMFID':
          result = filterListBy(billingInfoSummarys, 'CustomerMasterFileId', id);
          break;
        case 'AccountId':
          result = filterListBy(billingInfoSummarys, 'AccountId', id);
          break;
      }
      send(result, setter, cb);
    };
  }

  (function() {
    // mockery.random = Math.random;

    mockery.addModulusValueFunc('ACCT_NAME', [
      'Main Home Security System',
      'Vacation Home Security System',
      'FWI Firewall',
      'Henry Tracker',
      'Life Lock Service',
      'Nu Manna ',
      'Strike Plate',
      'Window Film',
    ]);
    mockery.addModulusValueFunc('ACCT_DESC', [
      'This is the house where my family lives.  Here we do all our stuf.',
      'This home we like to go to when winter comes around.',
      'This is the firewall that protects our family from porn.',
      'This tracks Henry everywhere he goes',
      'This is my free life lock service',
      'This is my Nu Manna food storage plan',
      'Secures my doors',
      'Protects my windows',
    ]);
    mockery.addModulusValueFunc('DUE', [
      39.94,
      32.95,
      14.99,
      10,
      0,
      59.95,
      null,
      null,
    ]);
    mockery.addModulusValueFunc('DUEDATE', [
      '2014-01-15T00:00:00',
      '2014-01-15T00:00:00',
      '2014-01-05T00:00:00',
      '2014-01-05T00:00:00',
      '2014-01-05T00:00:00',
      '2014-01-10T00:00:00',
      null,
      null,
    ]);
    mockery.addModulusValueFunc('NUNITS', [
      null,
      null,
      null,
      null,
      null,
      null,
      1,
      4,
    ]);
    mockery.addModulusValueFunc('AGING', [
      'Current',
      '1 to 30',
      '31 to 60',
      '61 to 90',
      '91 to 120',
      '> 120',
    ]);
  })();

  // data used in mock function
  var agings,
    billingInfoSummarys;

  agings = mockery.fromTemplate({
    // multiples of 6
    'list|6-6': [
      {
        CMFID: 3000001,
        Age: '@AGING',
        Value: '@MONEY(0,60)',
      }
    ]
  }).list;

  billingInfoSummarys = mockery.fromTemplate({
    'list|8-8': [
      {
        SummaryID: '@INC(summary)',
        CustomerMasterFileId: 3000001,
        AccountId: '@INC(account)',
        AccountName: '@ACCT_NAME',
        AccountDesc: '@ACCT_DESC',
        AmountDue: '@DUE',
        DueDate: '@DUEDATE',
        NumberOfUnites: '@NUNITS',
      }
    ],
  }).list;

  return mock;
});
