define('mock/app/dataservice.survey.mock', [
  'mock/mockery',
  'src/dataservice.survey'
], function(
  mockery,
  Dataservice
) {
  "use strict";

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
    tokenCount = 0,
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

  // mockery.random = Math.random;

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
    'list|5-7': [
      {
        TokenID: '@INC(token)',
        Token: '@SV_TOKEN',
      }
    ],
  }).list;

  questionMeanings = mockery.fromTemplate({
    'list|30-30': [
      {
        QuestionMeaningID: '@INC(questionMeaning)',
        SurveyTypeId: '@REF_INC(surveyType)',
        Name: '@TEXT(15,30)',
      }
    ],
  }).list;

  questionMeanings_Tokens_Map = mockery.fromTemplate({
    'list|50-50': [
      {
        QuestionMeaningId: '@FK(questionMeaning)',
        TokenId: '@REF_INC(token)',
      }
    ],
  }).list;

  questions = mockery.fromTemplate({
    'list|5-5': [
      {
        QuestionID: '@INC(question)',
        SurveyId: '@REF_INC(survey)',
        QuestionMeaningId: '@REF_INC(questionMeaning)',
        ParentId: null,
        GroupOrder: '@NUMBER(0,5)',
        MapToTokenId: '@REF_INC(token)',
      }
    ],
  }).list.concat(mockery.fromTemplate({
    'list|15-15': [
      {
        QuestionID: '@INC(question)',
        SurveyId: '@REF_INC(survey)',
        QuestionMeaningId: '@REF_INC(questionMeaning)',
        ParentId: '@REF_INC(question)',
        GroupOrder: '@NUMBER(0,5)',
        MapToTokenId: '@REF_INC(token)',
      }
    ],
  }).list);
  questionTranslations = mockery.fromTemplate({
    'list|20-20': [
      {
        QuestionTranslationID: '@INC(questionTranslation)',
        SurveyTranslationId: 1000, //'@FK(surveyTranslation)',
        QuestionId: '@FK(question)',
        TextFormat: '@TEXT(20,40)?',
      }
    ],
  }).list;

  possibleAnswers = mockery.fromTemplate({
    'list|15-15': [
      {
        PossibleAnswerID: '@INC(possibleAnswer)',
        AnswerText: '@SV_PA',
      }
    ],
  }).list;

  questions_PossibleAnswers_Map = mockery.fromTemplate({
    'list|20-20': [
      {
        QuestionId: '@REF_INC(question)',
        PossibleAnswerId: '@REF_INC(possibleAnswer)',
      }
    ],
  }).list;



  return function(settings) {
    function send(cb, value) {
      setTimeout(function() {
        cb({
          Code: 0,
          Message: '',
          Value: value,
        });
      }, settings.timeout);
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

    Dataservice.prototype.getQuestionMeaningTokens = function(data, cb) {
      var list = [];
      questionMeanings_Tokens_Map.forEach(function(item) {
        if (item.QuestionMeaningId === data.QuestionMeaningID) {

          tokens.some(function(token) {
            if (item.TokenId === token.TokenID) {
              list.push(token);
              return true;
            }
          });
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

    Dataservice.prototype.getQuestionPossibleAnswers = function(data, cb) {
      var list = [];
      questions_PossibleAnswers_Map.forEach(function(item) {
        if (item.QuestionId === data.QuestionID) {

          possibleAnswers.some(function(pa) {
            if (item.PossibleAnswerId === pa.PossibleAnswerID) {
              list.push(pa);
              return true;
            }
          });
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
  };
});
