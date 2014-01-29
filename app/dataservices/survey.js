define('src/dataservices/survey', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var surveyServiceDomain = config.serviceDomain + '/surveysrv',
      result = {};

    [
      'tokens',
      'possibleAnswers',
      'surveyTypes',
      'questionMeanings',
      'surveys',
      'surveyTranslations',
      'questions',
      'questionTranslations',
      'questionMeaningTokenMaps',
      'questionPossibleAnswerMaps',
      'results',
    ].forEach(function(collectionName) {
        result[collectionName] = new DataserviceBase(collectionName, surveyServiceDomain);
      });

    return result;
  };
});
