define('mock/app/dataservice.survey.mock', [
  'src/dataservice.survey',
  'mock/mockery',
], function(
  Dataservice,
  mockery
) {
  "use strict";

  function mock(settings) {
    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function send(cb, value, timeout) {
      setTimeout(function() {
        cb({
          Code: 0,
          Message: '',
          Value: clone(value),
        });
      }, timeout || settings.timeout);
    }

    Dataservice.prototype.getSurveyTypes = function(data, cb) {
      send(cb, surveyTypes);
    };
    Dataservice.prototype.getSurveys = function(data, cb) {
      var list = [];
      surveys.forEach(function(item) {
        if (item.SurveyTypeId === data.SurveyTypeID) {
          list.push(item);
        }
      });
      send(cb, list);
    };
    Dataservice.prototype.getTokens = function(data, cb) {
      send(cb, tokens);
    };
    Dataservice.prototype.getQuestionMeanings = function(data, cb) {
      var list = [];
      questionMeanings.forEach(function(item) {
        if (item.SurveyTypeId === data.SurveyTypeID) {
          list.push(item);
        }
      });
      send(cb, list);
    };
    Dataservice.prototype.getQuestionMeaningTokenMaps = function(data, cb) {
      var list = [];
      questionMeanings_Tokens_Map.forEach(function(item) {
        if (item.QuestionMeaningId === data.QuestionMeaningID) {
          list.push(item);
        }
      });
      send(cb, list);
    };
    Dataservice.prototype.getQuestions = function(data, cb) {
      var list = [];
      questions.forEach(function(item) {
        if (item.SurveyId === data.SurveyID) {
          list.push(item);
        }
      });
      send(cb, list);
    };
    Dataservice.prototype.getSurveyTranslations = function(data, cb) {
      var list = [];
      surveyTranslations.forEach(function(item) {
        if (item.SurveyId === data.SurveyID) {
          list.push(item);
        }
      });
      send(cb, list);
    };
    Dataservice.prototype.getPossibleAnswers = function(data, cb) {
      send(cb, possibleAnswers);
    };
    Dataservice.prototype.getQuestionPossibleAnswerMaps = function(data, cb) {
      var list = [];
      questions_PossibleAnswers_Map.forEach(function(item) {
        if (item.QuestionId === data.QuestionID) {
          list.push(item);
        }
      });
      send(cb, list);
    };
    Dataservice.prototype.getQuestionTranslations = function(data, cb) {
      var list = [];
      questionTranslations.forEach(function(item) {
        if (item.SurveyTranslationId === data.SurveyTranslationID) {
          list.push(item);
        }
      });
      send(cb, list);
    };





    Dataservice.prototype.saveQuestionMeaning = function(data, cb) {
      send(cb, createOrUpdate(questionMeanings, 'QuestionMeaningID', '@INC(questionMeaning)', {
        QuestionMeaningID: data.QuestionMeaningID,
        SurveyTypeId: data.SurveyTypeId,
        Name: data.Name,
      }));
    };
    Dataservice.prototype.saveQuestion = function(data, cb) {
      send(cb, createOrUpdate(questions, 'QuestionID', '@INC(question)', {
        QuestionID: data.QuestionID,
        SurveyId: data.SurveyId,
        QuestionMeaningId: data.QuestionMeaningId,
        ParentId: data.ParentId,
        GroupOrder: data.GroupOrder,
        MapToTokenId: data.MapToTokenId,
      }));
    };
    Dataservice.prototype.saveQuestionTranslation = function(data, cb) {
      send(cb, createOrUpdate(questionTranslations, 'QuestionTranslationID', '@INC(questionTranslation)', {
        QuestionTranslationID: data.QuestionTranslationID,
        SurveyTranslationId: data.SurveyTranslationId,
        QuestionId: data.QuestionId,
        TextFormat: data.TextFormat,
      }));
    };

    function createOrUpdate(list, idName, idTemplate, newValue) {
      var id = newValue[idName],
        index;
      if (id > 0) {
        if (!list.some(function(item, i) {
          if (item[idName] === id) {
            index = i;
            return true;
          }
        })) {
          throw new Error('invalid id. id not in list.');
        }

        // replace old value with new value
        list.splice(index, 1, newValue);
      } else {
        newValue[idName] = mockery.fromTemplate(idTemplate);
        // add new value
        list.push(newValue);
      }
      return newValue;
    }



    Dataservice.prototype.saveQuestionMeaningTokenMap = function(data, cb) {
      send(cb, saveWithNoPKey(questionMeanings_Tokens_Map, {
        QuestionMeaningId: data.QuestionMeaningId,
        TokenId: data.TokenId,
        IsDeleted: data.IsDeleted,
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
      }));
    };
    Dataservice.prototype.saveQuestionPossibleAnswerMap = function(data, cb) {
      send(cb, saveWithNoPKey(questions_PossibleAnswers_Map, {
        QuestionId: data.QuestionId,
        PossibleAnswerId: data.PossibleAnswerId,
        Expands: data.Expands,
        IsDeleted: data.IsDeleted,
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
      }));
    };

    function saveWithNoPKey(list, newValue, findFunc) {
      var index = findFunc(list, newValue);
      if (index > -1) {
        // update
        list.splice(index, 1, newValue);
      } else {
        // create
        list.push(newValue);
      }
      return newValue;
    }
  }

  (function() {
    // mockery.random = Math.random;

    var tokenCount = 0,
      tokenValues = [
      'CompanyName',
      'ADUserDisplayName',

      'PrimaryCustomer.Name',
      'PrimaryCustomer.LastName',

      'PremiseAddress.Street',
      'PremiseAddress.City',
      'PremiseAddress.State',
      'PremiseAddress.Zip',

      'SystemDetails.PremisePhone',
    ],
      paCount = 0,
      paValues = [
      'yes',
      'no',
      'maybe',
    ],
      localeCount = 0,
      localeValues = [
      'en',
      'it',
    ];

    function modulusValue(count, values) {
      return values[count % values.length];
    }

    mockery.fn.SV_TOKEN = function() {
      return modulusValue(tokenCount++, tokenValues);
    };
    mockery.fn.SV_PA = function() {
      return modulusValue(paCount++, paValues);
    };
    mockery.fn.LOCALE = function() {
      return modulusValue(localeCount++, localeValues);
    };
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
    questions_PossibleAnswers_Map;

  surveyTypes = mockery.fromTemplate({
    'list|1-1': [
      {
        SurveyTypeID: '@INC(surveyType)',
        Name: 'PreSurvey',
      }
    ],
  }).list;
  surveys = mockery.fromTemplate({
    'list|1-1': [
      {
        SurveyID: '@INC(survey)',
        SurveyTypeId: '@REF_INC(surveyType)',
        Version: '@NUMBER(1,2).1.@INC(surveyVersion)',
      }
    ],
  }).list;
  surveyTranslations = mockery.fromTemplate({
    'list|2-2': [
      {
        SurveyTranslationID: '@INC(surveyTranslation)',
        SurveyId: '@REF_INC(survey)',
        LocalizationCode: '@LOCALE',
      }
    ],
  }).list;

  tokens = mockery.fromTemplate({
    'list|9-9': [
      {
        TokenID: '@INC(token)',
        Token: '@SV_TOKEN',
      }
    ],
  }).list;

  questionMeanings = mockery.fromTemplate({
    'list|10-10': [
      {
        QuestionMeaningID: '@INC(questionMeaning)',
        SurveyTypeId: '@REF_INC(surveyType)',
        Name: '@TEXT(15,30)',
      }
    ],
  }).list;

  questionMeanings_Tokens_Map = mockery.fromTemplate({
    'list|5-5': [
      {
        QuestionMeaningId: '@FK(questionMeaning)',
        TokenId: '@REF_INC(token)',
        IsDeleted: false,
      }
    ],
  }).list;

  questions = mockery.fromTemplate({
    'list|1-1': [
      {
        QuestionID: '@INC(question)',
        SurveyId: '@REF_INC(survey)',
        QuestionMeaningId: '@REF_INC(questionMeaning)',
        ParentId: null,
        GroupOrder: null, //'@NUMBER(0,5)',
        MapToTokenId: '@REF_INC(token)',
      }
    ],
  }).list;
  // .concat(mockery.fromTemplate({
  //   'list|1-1': [
  //     {
  //       QuestionID: '@INC(question)',
  //       SurveyId: '@REF_INC(survey)',
  //       QuestionMeaningId: '@REF_INC(questionMeaning)',
  //       ParentId: '@REF_INC(question)',
  //       GroupOrder: null, //'@NUMBER(0,5)',
  //       MapToTokenId: '@REF_INC(token)',
  //     }
  //   ],
  // }).list);
  // set correct GroupOrders
  (function() {
    var countMap = {};
    questions.forEach(function(q) {
      var parentId = q.ParentId || 'null',
        count = countMap[parentId] || 1;
      countMap[parentId] = count + 1;
      q.GroupOrder = count - 1;
    });
  })();
  questionTranslations = mockery.fromTemplate({
    'list|1-1': [
      {
        QuestionTranslationID: '@INC(questionTranslation)',
        SurveyTranslationId: 1000, //'@FK(surveyTranslation)',
        QuestionId: '@FK(question)',
        TextFormat: '@TEXT(20,40)?',
      }
    ],
  }).list;

  possibleAnswers = mockery.fromTemplate({
    'list|3-3': [
      {
        PossibleAnswerID: '@INC(possibleAnswer)',
        AnswerText: '@SV_PA',
      }
    ],
  }).list;

  questions_PossibleAnswers_Map = mockery.fromTemplate({
    'list|2-2': [
      {
        QuestionId: '@FK(question)',
        PossibleAnswerId: '@FK(possibleAnswer)',
        Expands: true,
        IsDeleted: false,
      }
    ],
  }).list;

  return mock;
});
