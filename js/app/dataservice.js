define('src/dataservice', [
  'src/dataservice.qualify',
  'src/dataservice.survey'
], function(
  QualifyDataservice,
  SurveyDataservice
) {
  "use strict";
  return {
    qualify: new QualifyDataservice(),
    survey: new SurveyDataservice(),
  };
});
