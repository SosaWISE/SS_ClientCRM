define('mock/dataservice.survey.mock', [
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

    dataservice.survey.tokens.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(tokens, 'TokenID', id);
          break;
      }
      send(result, setter, cb);
    };

    dataservice.survey.possibleAnswers.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(possibleAnswers, 'PossibleAnswerID', id);
          break;
      }
      send(result, setter, cb);
    };

    dataservice.survey.surveyTypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(surveyTypes, 'SurveyTypeID', id);
          break;
        case 'surveys':
          result = filterListBy(surveys, 'SurveyTypeId', id);
          break;
        case 'questionMeanings':
          result = filterListBy(questionMeanings, 'SurveyTypeId', id);
          break;
      }
      send(result, setter, cb);
    };

    dataservice.survey.questionMeanings.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(questionMeanings, 'QuestionMeaningID', id);
          break;
        case 'questionMeaningTokenMaps':
          result = filterListBy(questionMeanings_Tokens_Map, 'QuestionMeaningId', id);
          break;
      }
      send(result, setter, cb);
    };

    dataservice.survey.surveys.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(surveys, 'SurveyID', id);
          break;
        case 'surveyType':
          result = findSingleBy(surveys, 'SurveyID', id);
          if (result) {
            result = findSingleBy(surveyTypes, 'SurveyTypeID', result.SurveyTypeId);
          }
          break;
        case 'questions':
          result = filterListBy(questions, 'SurveyId', id);
          break;
        case 'surveyTranslations':
          result = filterListBy(surveyTranslations, 'SurveyId', id);
          break;
      }
      send(result, setter, cb);
    };

    dataservice.survey.questions.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(questions, 'QuestionID', id);
          break;
        case 'questionPossibleAnswerMaps':
          result = filterListBy(questions_PossibleAnswers_Map, 'QuestionId', id);
          break;
      }
      send(result, setter, cb);
    };

    dataservice.survey.surveyTranslations.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(surveyTranslations, 'SurveyTranslationID', id);
          break;
        case 'questionTranslations':
          result = filterListBy(questionTranslations, 'SurveyTranslationId', id);
          break;
      }
      send(result, setter, cb);
    };





    dataservice.survey.surveyTypes.save = function(data, setter, cb) {
      send(createOrUpdate(surveyTypes, 'SurveyTypeID', '@INC(surveyType)', {
        SurveyTypeID: data.SurveyTypeID,
        Name: data.Name,
      }), setter, cb);
    };
    dataservice.survey.surveys.save = function(data, setter, cb) {
      send(createOrUpdate(surveys, 'SurveyID', '@INC(survey)', {
        SurveyID: data.SurveyID,
        SurveyTypeId: data.SurveyTypeId,
        Version: data.Version,
      }), setter, cb);
    };
    dataservice.survey.questionMeanings.save = function(data, setter, cb) {
      send(createOrUpdate(questionMeanings, 'QuestionMeaningID', '@INC(questionMeaning)', {
        QuestionMeaningID: data.QuestionMeaningID,
        SurveyTypeId: data.SurveyTypeId,
        Name: data.Name,
      }), setter, cb);
    };
    dataservice.survey.questions.save = function(data, setter, cb) {
      send(createOrUpdate(questions, 'QuestionID', '@INC(question)', {
        QuestionID: data.QuestionID,
        SurveyId: data.SurveyId,
        QuestionMeaningId: data.QuestionMeaningId,
        ParentId: data.ParentId,
        GroupOrder: data.GroupOrder,
        MapToTokenId: data.MapToTokenId,
      }), setter, cb);
    };
    dataservice.survey.questionTranslations.save = function(data, setter, cb) {
      send(createOrUpdate(questionTranslations, 'QuestionTranslationID', '@INC(questionTranslation)', {
        QuestionTranslationID: data.QuestionTranslationID,
        SurveyTranslationId: data.SurveyTranslationId,
        QuestionId: data.QuestionId,
        TextFormat: data.TextFormat,
      }), setter, cb);
    };
    dataservice.survey.surveyTranslations.save = function(data, setter, cb) {
      send(createOrUpdate(surveyTranslations, 'SurveyTranslationID', '@INC(surveyTranslation)', {
        SurveyTranslationID: data.SurveyTranslationID,
        SurveyId: data.SurveyId,
        LocalizationCode: data.LocalizationCode,
      }), setter, cb);
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



    dataservice.survey.questionMeaningTokenMaps.save = function(data, setter, cb) {
      send(saveWithNoPKey(questionMeanings_Tokens_Map, {
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
    dataservice.survey.questionPossibleAnswerMaps.save = function(data, setter, cb) {
      send(saveWithNoPKey(questions_PossibleAnswers_Map, {
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
    ],
      stCount = 0,
      stValues = [
      'Pre Survey',
      'Post Survey',
      'Some Survey',
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
    mockery.fn.SV_TYPE = function() {
      return modulusValue(stCount++, stValues);
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
    'list|3-3': [
      {
        SurveyTypeID: '@INC(surveyType)',
        Name: '@SV_TYPE',
      }
    ],
  }).list;
  surveys = mockery.fromTemplate({
    'list|2-2': [
      {
        SurveyID: '@INC(survey)',
        SurveyTypeId: '@FK(surveyType)',
        Version: '@NUMBER(1,2).1.@INC(surveyVersion)',
      }
    ],
  }).list;
  surveyTranslations = mockery.fromTemplate({
    'list|2-2': [
      {
        SurveyTranslationID: '@INC(surveyTranslation)',
        SurveyId: 1,
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
    'list|4-4': [
      {
        QuestionMeaningID: '@INC(questionMeaning)',
        SurveyTypeId: 1,
        Name: '@TEXT(15,30)',
      }
    ],
  }).list;

  questionMeanings_Tokens_Map = mockery.fromTemplate({
    'list|5-5': [
      {
        QuestionMeaningId: '@FK(questionMeaning)',
        TokenId: '@FK(token)',
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
      q.GroupOrder = count;
    });
  })();
  questionTranslations = mockery.fromTemplate({
    'list|1-1': [
      {
        QuestionTranslationID: '@INC(questionTranslation)',
        SurveyTranslationId: 1, //'@FK(surveyTranslation)',
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
        Expands: '@BOOL',
      }
    ],
  }).list;

  return mock;
});
