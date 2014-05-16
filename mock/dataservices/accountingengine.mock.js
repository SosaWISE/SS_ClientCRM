define('mock/dataservices/accountingengine.mock', [
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

    dataservice.accountingengine.aging.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          // result = mockery.filterListBy(agings, 'CMFID', id);
          result = mockery.fromTemplate({
            'list|6-6': [ // multiples of 6
              {
                CMFID: id,
                Age: '@AGING',
                Value: '@MONEY(0,60)',
              }
            ]
          }).list;
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.accountingengine.billingInfoSummary.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(billingInfoSummarys, 'SummaryID', id);
          break;
        case 'CMFID':
          result = mockery.filterListBy(billingInfoSummarys, 'CustomerMasterFileId', id);
          if (!result || !result.length) {
            billingInfoTmpl.CustomerMasterFileId = id;
            result = mockery.fromTemplate({
              'list|8-8': [billingInfoTmpl], // multiples of 8
            }).list;
            // add to list
            billingInfoSummarys = billingInfoSummarys.concat(result);
          }
          break;
        case 'AccountId':
          result = mockery.filterListBy(billingInfoSummarys, 'AccountId', id);
          break;
      }

      send(0, result, setter, cb);
    };

    dataservice.accountingengine.customerSearches.save = function(params, setter, cb) {
      var result, template, fname, lname, data = params.data;
      switch (params.link || null) {
        case null:
          template = {};
          fname = (data.FirstName || '@NAME');
          lname = (data.LastName || '@LASTNAME');
          template['list|' + data.PageSize + '-' + data.PageSize] = [ //
            {
              CustomerMasterFileID: '@NUMBER(3000001,3000100)',
              Fullname: '[C]: ' + fname + ' ' + lname,
              City: (data.City || '@LASTNAME(citycb)') + ', ' +
                (data.StateId || 'UT') + ' ' +
                (data.PostalCode || '8@NUMBER(3000,5999)') + '-@NUMBER(1000,9999)',
              Phone: 'H: ' + (data.PhoneNumber || '@PHONE'),
              Email: strings.format('{0}.{1}@@LASTNAME(cb).com', fname, lname),
              'AccountTypes|1-5': ['@ACCT_TYPE'],
            },
          ];
          result = mockery.fromTemplate(template).list;
          break;
      }
      send(0, result, setter, cb);
    };
  }

  (function() {
    // mockery.random = Math.random;

    mockery.addModulusValueFunc('ACCT_NAME', [ // multiples of 8
      'Main Home Security System',
      'Vacation Home Security System',
      'FWI Firewall',
      'Henry Tracker',
      'Life Lock Service',
      'Nu Manna ',
      'Strike Plate',
      'Window Film',
    ]);
    mockery.addModulusValueFunc('ACCT_DESC', [ // multiples of 8
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
    mockery.addModulusValueFunc('AGING', [ // multiples of 6
      'Current',
      '1 to 30',
      '31 to 60',
      '61 to 90',
      '91 to 120',
      '> 120',
    ]);
    mockery.addModulusValueFunc('ACCT_TYPE', [
      'LEAD', //   Lead
      'ALRM', //   Alarm System
      'INSEC', //  Internet Security
      'LFLCK', //  Life Lock
      'NUMAN', //  NuManna
      'PERS', //   GPS Tracking Device
      'SKPLT', //  Strick Plate
      'WNFIL', //  Window Film
    ]);
  })();

  // data used in mock function
  var cmfidList,
    billingInfoSummarys,
    billingInfoTmpl;

  cmfidList = mockery.fromTemplate({
    'list|2-2': ['@INC(customerMasterFile,3000001)']
  }).list;

  billingInfoTmpl = {
    SummaryID: '@INC(summary)',
    CustomerMasterFileId: 'set me!!!',
    AccountId: '@INC(account)',
    AccountName: '@ACCT_NAME',
    AccountDesc: '@ACCT_DESC',
    AmountDue: '@DUE',
    DueDate: '@DUEDATE',
    NumberOfUnites: '@NUNITS',
  };

  billingInfoSummarys = [];
  cmfidList.forEach(function(cmfid) {
    billingInfoTmpl.CustomerMasterFileId = cmfid;
    billingInfoSummarys = billingInfoSummarys.concat(mockery.fromTemplate({
      'list|8-8': [billingInfoTmpl], // multiples of 8
    }).list);
  });

  mock.addAccount = function(cmfid) {
    billingInfoTmpl.CustomerMasterFileId = cmfid;
    var bis = mockery.fromTemplate(billingInfoTmpl);

    billingInfoSummarys.push(bis);

    return bis;
  };

  return mock;
});
