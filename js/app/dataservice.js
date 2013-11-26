define('src/dataservice', [
  'src/dataservice.user',
  'src/dataservice.session',
  'src/dataservice.qualify',
  'src/dataservice.survey'
], function(
  UserDataservice,
  SessionDataservice,
  QualifyDataservice,
  createSurveyDataservices
) {
  "use strict";
  return {
    user: new UserDataservice(),
    session: new SessionDataservice(),
    qualify: new QualifyDataservice(),
    survey: createSurveyDataservices(),
  };
});
