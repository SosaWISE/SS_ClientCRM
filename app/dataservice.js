define('src/dataservice', [
  'src/dataservice.user',
  'src/dataservice.session',
  'src/dataservice.qualify',
  'src/dataservice.survey',
  'src/dataservice.salessummary',
  'src/dataservice.accountingengine',
  'src/dataservice.maincore',
  'src/scrum/scrumservice',
], function(
  UserDataservice,
  SessionDataservice,
  QualifyDataservice,
  createSurveyDataservices,
  createSalesSummaryDataservices,
  createAccountingEngineDataservices,
  createMainCoreDataservices,
  createScrumService
) {
  "use strict";
  return {
    user: new UserDataservice(),
    session: new SessionDataservice(),
    qualify: new QualifyDataservice(),
    survey: createSurveyDataservices(),
    salessummary: createSalesSummaryDataservices(),
    accountingengine: createAccountingEngineDataservices(),
    maincore: createMainCoreDataservices(),
    scrum: createScrumService(),
  };
});
