define('src/dataservice', [
  'src/scrum/scrumservice',
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
  'src/dataservices/scheduleenginesrv',
  'src/dataservices/humanresourcesrv',

], function(
  createScrumService,
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
  createInventoryEngineSrv,
  createScheduleEngineSrv,
  createHumanResourceSrv

) {
  "use strict";
  return {
    scrum: createScrumService(),
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
    inventoryenginesrv: createInventoryEngineSrv(),
    scheduleenginesrv: createScheduleEngineSrv(),
    humanresourcesrv: createHumanResourceSrv()
  };
});
