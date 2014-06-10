define('src/dataservice', [
  'src/core/dataservice.base',
  'src/config',
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
  'src/dataservices/swingaccountsrv',
  'src/dataservices/inventoryenginesrv',

], function(
  DataserviceBase,
  config,
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
  createSwingAccountSrv,
  createInventoryEngineSrv

) {
  "use strict";
  return {
    base: new DataserviceBase(null, config.serviceDomain),
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
    swingaccountsrv: createSwingAccountSrv(),
    inventoryenginesrv: createInventoryEngineSrv()
  };
});
