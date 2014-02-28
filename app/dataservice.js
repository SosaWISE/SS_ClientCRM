define('src/dataservice', [
  'src/dataservices/user',
  'src/dataservices/session',
  'src/dataservices/qualify',
  'src/dataservices/survey',
  'src/dataservices/salessummary',
  'src/dataservices/accountingengine',
  'src/dataservices/maincore',
  'src/dataservices/monitoringstation',
  'src/dataservices/invoicesrv',
], function(
  UserDataservice,
  SessionDataservice,
  QualifyDataservice,
  createSurveyDataservices,
  createSalesSummaryDataservices,
  createAccountingEngineDataservices,
  createMainCoreDataservices,
  MonitoringStationDataService,
  crateInvoicesrv
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
    monitoringstation: new MonitoringStationDataService(),
    invoicesrv: crateInvoicesrv(),
  };
});
