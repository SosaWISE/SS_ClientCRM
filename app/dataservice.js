define('src/dataservice', [
  'src/dataservices/user',
  'src/dataservices/session',
  'src/dataservices/qualify',
  'src/dataservices/survey',
  'src/dataservices/salessummary',
  'src/dataservices/accountingengine',
  'src/dataservices/maincore',
  'src/dataservices/monitoringstationsrv',
  'src/dataservices/msaccountsetupsrv',
  'src/dataservices/invoicesrv',
  'src/dataservices/swingaccountsrv'
], function(
  UserDataservice,
  SessionDataservice,
  QualifyDataservice,
  createSurveyDataservices,
  createSalesSummaryDataservices,
  createAccountingEngineDataservices,
  createMainCoreDataservices,
  createMonitoringStationSrv,
  createMsAccountSetupSrv,
  createInvoicesrv,
  createSwingAccountSrv
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
    monitoringstationsrv: createMonitoringStationSrv(),
    msaccountsetupsrv: createMsAccountSetupSrv(),
    invoicesrv: createInvoicesrv(),
    swingaccountsrv: createSwingAccountSrv()
  };
});
