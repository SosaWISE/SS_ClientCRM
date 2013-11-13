define('src/dataservice', [
  'src/dataservice.qualify',
  'src/dataservice.survey'
], function(
  QualifyDataservice,
  createSurveyDataservices
) {
  "use strict";
  return {
    qualify: new QualifyDataservice(),
    survey: createSurveyDataservices(),
  };
});
