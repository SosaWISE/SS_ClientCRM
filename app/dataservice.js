define("src/dataservice", [
  "src/core/dataservice.base",
  "src/config",
  "src/dataservices/user",
  "src/dataservices/session",
], function(
  DataserviceBase,
  config,
  UserDataservice,
  SessionDataservice
) {
  "use strict";

  function createService(name, subPaths) {
    var serviceDomain = config.serviceDomain + "/" + name,
      result = {};

    subPaths.forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  }

  return {
    base: new DataserviceBase(null, config.serviceDomain),
    user: new UserDataservice(),
    session: new SessionDataservice(),

    //
    // with /api
    //
    api_contractAdmin: createService("api/contractAdmin", [
      "accounts",
      "accountSalesInformationExtras",
    ]),
    api_qualify: createService("api/qualify", [
      "customerMasterFiles",
    ]),
    api_ticket: createService("api/ticket", [
      "teams",
    ]),

    //
    // no /api
    //

    accountingengine: createService("accountingenginesrv", [
      "aging",
      "billingInfoSummary",
      "billingHistory",
      "invoices",
      "invoiceItems",
      "customerSearches",
      "customerCardInfos",
      "customers",
    ]),

    humanresourcesrv: createService("humanresourcesrv", [
      "RuTeamLocationList",
      "RuTechnician",
      "RuTechnicianList",
    ]),
    hr: createService("humanresourcesrv", [
      "RuTechnicianList",
      //
      "payscales",
      "phoneCellCarriers",
      "recruits",
      "roleLocations",
      "schools",
      "seasons",
      "skills",
      "teams",
      "teamLocations",
      "userEmployeeTypes",
      "userTypes",
      "users",
    ]),

    inventoryenginesrv: createService("inventoryenginesrv", [
      "PurchaseOrder",
      "PurchaseOrderItems",
      "PackingSlip",
      "ProductBarcode",
      "PackingSlipItem",
      "ProductBarcodeTracking",
      "WarehouseSiteList",
      "LocationTypeList",
      "Locations",
      "ProductBarcodeLocations",
      "VendorList",
    ]),

    invoicesrv: createService("invoicesrv", [
      "invoices",
      "invoiceItems",
      "items",
    ]),

    maincore: createService("maincoresrv", [
      "departments",
      "notes",
      "notecategory1",
      "notecategory2",
      "notetypes",
      "localizations",
    ]),

    monitoringstationsrv: createService("monitoringStationSrv", [
      "msAccounts",
      "msIndustryAccounts",
      "accounts",
      "msAccountSalesInformations",
      "dispatchAgencies",
      "accountDispatchAgencyAssignments",
      "premiseAddress",
      "dispatchAgencyTypes",
      "msAccountStatusInformations"
    ]),

    msaccountsetupsrv: createService("msaccountsetupsrv", [
      "accounts",
      "emergencyContacts",
      "emergencyContactPhoneTypes",
      "emergencyContactRelationships",
      "monitoringStationOS",
      "equipments",
      "equipmentExistings",
      "systemDetails",
      "techDetails",
      "serviceTypes",
      "panelTypes",
      "dslSeizureTypes",
      "alarmcom",
    ]),

    qualify: createService("qualifysrv", [
      "salesrep",
      "technician",
      "address",
      "addressValidation",
      "runCredit",
      "qualifyCustomerInfos",
      "insideSales",
      "customerMasterFiles",
      "leads",
    ]),

    salessummary: createService("msaccountsetupsrv", [
      "pointSystems",
      "activationfees",
      "surveytypes",
      "panelTypes",
      "cellularTypes",
      "vendorAlarmcomPacakges",
      "equipmentbypointsget",
      "contractLengthsGet",
      "frequentlyInstalledEquipmentGet",
      "invoiceRefresh",
      "invoiceMsIsntalls",
    ]),

    scheduleenginesrv: createService("scheduleenginesrv", [
      "TicketStatusCodeList",
      "TicketTypeList",
      "SeTicketList",
      "SeTicket",
      "SeScheduleTicket",
      "SeScheduleTicketList",
      "SeScheduleBlockList",
      "SeScheduleBlock",
      "SeTechnicianAvailability",
      "SeTicketList",
      "SeTechnicianAvailabilityList",
      "SeZipCode",
      "SeTicketReScheduleList",
    ]),

    survey: createService("surveysrv", [
      "tokens",
      "possibleAnswers",
      "surveyTypes",
      "questionMeanings",
      "surveys",
      "surveyTranslations",
      "questions",
      "questionTranslations",
      "questionMeaningTokenMaps",
      "questionPossibleAnswerMaps",
      "results",
    ]),

    swingaccountsrv: createService("swingaccountsrv", [
      // "accounts",
      "CustomerSwingInfo",
      "CustomerSwingPremiseAddress",
      "CustomerSwingEmergencyContact",
      "CustomerSwingEquipmentInfo",
      "CustomerSwingSystemDetails",
      "CustomerSwungInfo",
      "CustomerSwingInterim",
      "CustomerSwingAddDnc",
      /* "msAccount",
      "msAccountCustomer",
      "msAccountPremiseAddress",
      "msAccountEmergencyContact",
      "msAccountInventory",
      "msAccountEquipment",
      "msZoneType",
      "msEquipmentLocation",*/
    ]),

    ticketsrv: createService("ticketsrv", [
      "appointments",
      "serviceTickets",
      "serviceTypes",
      "skills",
      "statusCodes",
      "techs",
    ]),
  };
});
