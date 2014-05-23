define('mock/dataservices/survey.mock', [
  'src/dataservice',
  'src/core/utils',
  'src/core/mockery',
], function(
  dataservice,
  utils,
  mockery
) {
  "use strict";

  function mock(settings) {
    function send(code, value, setter, cb, timeout) {
      mockery.send(code, value, setter, cb, timeout || settings.timeout);
    }

    dataservice.survey.tokens.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(tokens, 'TokenID', id);
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.survey.possibleAnswers.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(possibleAnswers, 'PossibleAnswerID', id);
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.survey.surveyTypes.read = function(params, setter, cb) {
      var result, id = params.id,
        code = 0;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(surveyTypes, 'SurveyTypeID', id);
          break;
        case 'surveys':
          result = mockery.filterListBy(surveys, 'SurveyTypeId', id);
          break;
        case 'questionMeanings':
          result = mockery.filterListBy(questionMeanings, 'SurveyTypeId', id);
          break;
        case 'activeSurvey':
          // get all surveys for type
          result = mockery.filterListBy(surveys, 'SurveyTypeId', id);
          // find first one that is marked as active or first in list?????
          result = mockery.findSingleBy(result, 'Active', true) || result[0];
          // webserver should return an error when result if null
          if (!result) {
            code = -1;
          }
          break;
      }
      send(code, result, setter, cb);
    };

    dataservice.survey.questionMeanings.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(questionMeanings, 'QuestionMeaningID', id);
          break;
        case 'questionMeaningTokenMaps':
          result = mockery.filterListBy(questionMeanings_Tokens_Map, 'QuestionMeaningId', id);
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.survey.surveys.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(surveys, 'SurveyID', id);
          break;
        case 'surveyType':
          result = mockery.findSingleBy(surveys, 'SurveyID', id);
          if (result) {
            result = mockery.findSingleBy(surveyTypes, 'SurveyTypeID', result.SurveyTypeId);
          }
          break;
        case 'questions':
          result = mockery.filterListBy(questions, 'SurveyId', id);
          break;
        case 'surveyTranslations':
          result = mockery.filterListBy(surveyTranslations, 'SurveyId', id);
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.survey.questions.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(questions, 'QuestionID', id);
          break;
        case 'questionPossibleAnswerMaps':
          result = mockery.filterListBy(questions_PossibleAnswers_Map, 'QuestionId', id);
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.survey.surveyTranslations.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(surveyTranslations, 'SurveyTranslationID', id);
          break;
        case 'questionTranslations':
          result = mockery.filterListBy(questionTranslations, 'SurveyTranslationId', id);
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.survey.results.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(surveyResults, 'ResultID', id);
          break;
        case 'answers':
          result = mockery.filterListBy(resultAnswers, 'ResultId', id);
          break;
      }
      send(0, result, setter, cb);
    };





    dataservice.survey.surveyTypes.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.createOrUpdate(surveyTypes, 'SurveyTypeID', '@INC(surveyType)', {
        SurveyTypeID: data.SurveyTypeID,
        Name: data.Name,
      }), setter, cb);
    };
    dataservice.survey.surveys.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.createOrUpdate(surveys, 'SurveyID', '@INC(survey)', {
        SurveyID: data.SurveyID,
        SurveyTypeId: data.SurveyTypeId,
        Version: data.Version,
      }), setter, cb);
    };
    dataservice.survey.questionMeanings.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.createOrUpdate(questionMeanings, 'QuestionMeaningID', '@INC(questionMeaning)', {
        QuestionMeaningID: data.QuestionMeaningID,
        SurveyTypeId: data.SurveyTypeId,
        Name: data.Name,
      }), setter, cb);
    };
    dataservice.survey.questions.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.createOrUpdate(questions, 'QuestionID', '@INC(questions)', {
        QuestionID: data.QuestionID,
        SurveyId: data.SurveyId,
        QuestionMeaningId: data.QuestionMeaningId,
        ParentId: data.ParentId,
        GroupOrder: data.GroupOrder,
        MapToTokenId: data.MapToTokenId,
        ConditionJson: data.ConditionJson,
      }), setter, cb);
    };
    dataservice.survey.questionTranslations.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.createOrUpdate(questionTranslations, 'QuestionTranslationID', '@INC(questionTranslation)', {
        QuestionTranslationID: data.QuestionTranslationID,
        SurveyTranslationId: data.SurveyTranslationId,
        QuestionId: data.QuestionId,
        TextFormat: data.TextFormat,
      }), setter, cb);
    };
    dataservice.survey.surveyTranslations.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.createOrUpdate(surveyTranslations, 'SurveyTranslationID', '@INC(surveyTranslation)', {
        SurveyTranslationID: data.SurveyTranslationID,
        SurveyId: data.SurveyId,
        LocalizationCode: data.LocalizationCode,
      }), setter, cb);
    };
    dataservice.survey.results.save = function(params, setter, cb) {
      var data = params.data,
        svResult;
      svResult = mockery.createOrUpdate(surveyResults, 'ResultID', '@INC(surveyResults)', {
        // ResultID: data.ResultID,
        AccountId: data.AccountId,
        SurveyTranslationId: data.SurveyTranslationId,
        // RecruitId: data.RecruitId,
        Caller: data.Caller,
        Passed: data.Passed,
        IsComplete: data.IsComplete,
        Context: data.Context,
        CreatedBy: data.CreatedBy,
        CreatedOn: new Date(),
      });

      // save Answers
      data.Answers.forEach(function(data) {
        mockery.createOrUpdate(resultAnswers, 'AnswerID', '@INC(resultAnswers)', {
          // AnswerID: data.AnswerID,
          ResultId: svResult.ResultID,
          QuestionId: data.QuestionId,
          AnswerText: data.AnswerText,
        });
      });

      // set Answers on result
      svResult.Answers = mockery.filterListBy(resultAnswers, 'ResultId', svResult.ResultID);

      send(0, svResult, setter, cb);
    };


    dataservice.survey.questionMeaningTokenMaps.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.saveWithNoPKey(questionMeanings_Tokens_Map, {
        QuestionMeaningId: data.QuestionMeaningId,
        TokenId: data.TokenId,
      }, function(list, value) {
        var index;
        list.some(function(item, i) {
          if (item.QuestionMeaningId === value.QuestionMeaningId &&
            item.TokenId === value.TokenId) {
            index = i;
            return true;
          }
        });
        return index;
      }), setter, cb);
    };
    dataservice.survey.questionPossibleAnswerMaps.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.saveWithNoPKey(questions_PossibleAnswers_Map, {
        QuestionId: data.QuestionId,
        PossibleAnswerId: data.PossibleAnswerId,
        Expands: data.Expands,
      }, function(list, value) {
        var index;
        list.some(function(item, i) {
          if (item.QuestionId === value.QuestionId &&
            item.PossibleAnswerId === value.PossibleAnswerId) {
            index = i;
            return true;
          }
        });
        return index;
      }), setter, cb);
    };
  }

  (function() {
    // mockery.random = Math.random;

    mockery.addModulusValueFunc('SV_TOKEN', [
      'CompanyName',
      'ADUserDisplayName',

      'PrimaryCustomer.Name',
      'PrimaryCustomer.LastName',

      'PremiseAddress.Street',
      'PremiseAddress.City',
      'PremiseAddress.State',
      'PremiseAddress.Zip',

      'SystemDetails.PremisePhone',
    ]);
    mockery.addModulusValueFunc('TOKEN_TYPES', [
      'string', // operators: all
      'number', // operators: all
      'bool', // operators: ==, !=
    ]);
    // mockery.addModulusValueFunc('LOGICAL_OPERATORS', ['&&', '||']);
    mockery.addModulusValueFunc('SV_PA', [
      'yes',
      'no',
      'maybe',
    ]);
    mockery.addModulusValueFunc('LOCALE', [
      'en',
      'it',
    ]);
    mockery.addModulusValueFunc('SV_TYPE', [
      'Pre Survey',
      'Post Survey',
      'Some Survey',
    ]);
  })();

  // data used in mock function
  var surveyTypes,
    surveys,
    surveyTranslations,
    tokens,
    questionMeanings,
    questionMeanings_Tokens_Map,
    questions,
    questionTranslations,
    possibleAnswers,
    questions_PossibleAnswers_Map,
    surveyResults,
    resultAnswers;

  surveyTypes = mockery.fromTemplate({
    'list|3-3': [ //
      {
        SurveyTypeID: '@INC(surveyType,1000)',
        Name: '@SV_TYPE',
      }
    ],
  }).list;
  surveys = mockery.fromTemplate({
    'list|2-2': [ //
      {
        SurveyID: '@INC(survey)',
        SurveyTypeId: '@FK(surveyType)',
        Version: '@NUMBER(1,2).1.@INC(surveyVersion)',
      }
    ],
  }).list;
  surveyTranslations = mockery.fromTemplate({
    'list|2-2': [ //
      {
        SurveyTranslationID: '@INC(surveyTranslation)',
        SurveyId: 1,
        LocalizationCode: '@LOCALE',
      }
    ],
  }).list;

  tokens = mockery.fromTemplate({
    'list|9-9': [ //
      {
        TokenID: '@INC(token)',
        Token: '@SV_TOKEN',
        ValueType: '@TOKEN_TYPES',
      }
    ],
  }).list;

  questionMeanings = mockery.fromTemplate({
    'list|4-4': [ //
      {
        QuestionMeaningID: '@INC(questionMeaning)',
        SurveyTypeId: 1000,
        Name: '@TEXT(15,30)',
      }
    ],
  }).list;

  questionMeanings_Tokens_Map = mockery.fromTemplate({
    'list|5-5': [ //
      {
        QuestionMeaningId: '@FK(questionMeaning)',
        TokenId: '@FK(token)',
      }
    ],
  }).list;

  questions = mockery.fromTemplate({
    'list|1-1': [ //
      {
        QuestionID: '@INC(questions)',
        SurveyId: 1, //'@REF_INC(survey)',
        QuestionMeaningId: '@FK(questionMeaning)',
        ParentId: null,
        GroupOrder: null, //'@NUMBER(0,5)',
        MapToTokenId: '@FK(token)',
      }
    ],
  }).list.concat(mockery.fromTemplate({
    'list|2-2': [ //
      {
        ParentId: '@FK(questions)',
        QuestionID: '@INC(questions)',
        SurveyId: 1, //'@REF_INC(survey)',
        QuestionMeaningId: '@FK(questionMeaning)',
        GroupOrder: null, //'@NUMBER(0,5)',
        MapToTokenId: '@FK(token)',
        ConditionJson: {
          TokenId: 3,
          Comparison: '==',
          Value: 'Bob',
        },
      }
    ],
  }).list);
  // set correct GroupOrders
  (function() {
    var countMap = {};
    questions.forEach(function(q) {
      var parentId = q.ParentId || 'null',
        count = countMap[parentId] || 1;
      countMap[parentId] = count + 1;
      q.GroupOrder = count;
    });
  })();
  questionTranslations = mockery.fromTemplate({
    'list|1-1': [ //
      {
        QuestionTranslationID: '@INC(questionTranslation)',
        SurveyTranslationId: 1, //'@FK(surveyTranslation)',
        QuestionId: '@FK(questions)',
        TextFormat: '@TEXT(20,40)?',
      }
    ],
  }).list;

  possibleAnswers = mockery.fromTemplate({
    'list|3-3': [ //
      {
        PossibleAnswerID: '@INC(possibleAnswer)',
        AnswerText: '@SV_PA',
      }
    ],
  }).list;

  questions_PossibleAnswers_Map = mockery.fromTemplate({
    'list|3-3': [ //
      {
        QuestionId: '@FK(questions)',
        PossibleAnswerId: '@FK(possibleAnswer)',
        Expands: true, //'@BOOL',
      }
    ],
  }).list;

  // surveyResults = mockery.fromTemplate({
  //   'list|1-1': [
  //     {
  //       ResultID: 1,
  //       SurveyId: 1,
  //       'Answers|3-3': [
  //         {
  //           AnswerID: '@FK(questions)',
  //           ResultId: 1,
  //           QuestionId: '@FK(questions)',
  //           AnswerText: '@SV_PA',
  //         }
  //       ],
  //     }
  //   ],
  // }).list;
  surveyResults = mockery.fromTemplate({
    'list|1-1': [ //
      {
        ResultID: '@INC(surveyResults)',
        SurveyTranslationId: 1,
        AccountId: 1,
        // RecruitId: -1, //boh?
        Caller: 'boh?',
        Passed: true,
        IsComplete: true,
        Context: JSON.stringify({
          CompanyName: 'Nexsense',
          ADUserDisplayName: 'auser',
          PrimaryCustomer: {
            Name: 'Bob',
            LastName: 'Bobbins',
            FullName: 'Bob Bobbins',
            Phone1: '(801) 555-1234',
          },
          PremiseAddress: {
            Street: '111 Technology Way',
            City: 'Orem',
            State: 'UT',
            Zip: '84059',
          },
          SystemDetails: {
            PremisePhone: '(801) 123-1234',
          },
          ContractTerms: {
            ContractLength: 60,
            BillingMethod: 2,
            MonthlyMonitoringFee: 49.99,
            TotalActivationFee: 199.99,
            ActivationFeePaymentMethod: 1,
            BillingDate: '15th',
            HasSalesUpgrades: true,
          },
          SalesRep: {
            FirstName: 'RepName',
          },
        }),
        CreatedBy: 'auser',
        CreatedOn: '@DATE',
      }
    ],
  }).list;

  resultAnswers = mockery.fromTemplate({
    'list|3-3': [ //
      {
        AnswerID: '@INC(resultAnswers)',
        ResultId: 1,
        QuestionId: '@FK(questions)',
        AnswerText: '@SV_PA',
      },
    ],
  }).list;

  mock.getAccountSurveyResultViews = function(accountId) {
    var resultViews = [];
    mockery.filterListBy(surveyResults, 'AccountId', accountId).forEach(function(svResult) {
      var svTranslation = mockery.findSingleBy(surveyTranslations, 'SurveyTranslationID', svResult.SurveyTranslationId),
        sv = mockery.findSingleBy(surveys, 'SurveyID', svTranslation.SurveyId),
        svType = mockery.findSingleBy(surveyTypes, 'SurveyTypeID', sv.SurveyTypeId);

      resultViews.push({
        ResultID: svResult.ResultID,
        SurveyTranslationId: svResult.SurveyTranslationId,
        AccountId: svResult.AccountId,
        // RecruitId: svResult.RecruitId,
        Caller: svResult.Caller,
        // Passed: svResult.Passed, // this will be decided by the server
        IsComplete: svResult.IsComplete,
        Context: svResult.Context,
        CreatedBy: svResult.CreatedBy,
        CreatedOn: svResult.CreatedOn,
        // ModifiedBy: svResult.ModifiedBy,
        // ModifiedOn: svResult.ModifiedOn,

        SurveyId: sv.SurveyID,
        Version: sv.Version,
        // IsCurrent: sv.IsCurrent, // ??

        SurveyType: svType.Name,
        SurveyTypeId: svType.SurveyTypeID,

        LocalizationCode: svTranslation.LocalizationCode,
      });
    });
    resultViews.sort(function(a, b) {
      return b.CreatedOn.getTime() - a.CreatedOn.getTime();
    });
    return resultViews;
  };

  return mock;
});
