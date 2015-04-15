define("src/account/salesinfo/v02/salesinfo.model", [
  "src/account/default/rep.find.vm",
  "src/account/salesinfo/options",
  "src/account/accounts-cache",
  "src/dataservice",
  "ko",
  "src/ukov",
  "src/core/combo.vm",
  "src/core/joiner",
  "src/core/utils",
], function(
  RepFindViewModel,
  salesInfoOptions,
  accountscache,
  dataservice,
  ko,
  ukov,
  ComboViewModel,
  joiner,
  utils
) {
  "use strict";

  function salesinfo_model(options) {
    utils.assertProps(options, [
      "layersVm",
      "handler",
      "yesNoOptions",
    ]);
    var handler = options.handler;

    var data = ukov.wrap({}, schema);

    data.AccountCreationTypeCvm = new ComboViewModel({
      selectedValue: data.AccountCreationTypeId,
      fields: accountscache.metadata("accountCreationTypes"),
    }).subscribe(accountscache.getList("accountCreationTypes"), handler);
    data.showExistingEquipment = ko.computed(function() {
      return data.AccountCreationTypeCvm.selectedValue() === "TKO";
    });

    data.PaymentTypeCvm = new ComboViewModel({
      selectedValue: data.PaymentTypeId,
      fields: accountscache.metadata("paymentTypes"),
    }).subscribe(accountscache.getList("paymentTypes"), handler);

    data.BillingDayCvm = new ComboViewModel({
      selectedValue: data.BillingDay,
      list: salesInfoOptions.billingDays,
    });

    data.AccountPackageCvm = new ComboViewModel({
      selectedValue: data.AccountPackageId,
      fields: accountscache.metadata("packages"),
    }).subscribe(accountscache.getList("packages"), handler);
    data.HasPackageUpgradesCvm = new ComboViewModel({
      selectedValue: data.HasPackageUpgrades,
      fields: options.yesNoOptions,
    });

    data.load = function(cb) {
      var join = joiner().after(cb);
      accountscache.ensure("accountCreationTypes", join.add());
      accountscache.ensure("paymentTypes", join.add());
      accountscache.ensure("packages", join.add());
    };


    data.repModel = ko.observable();
    data.tekModel = ko.observable();

    function createLoadRepFunc(modelSetter) {
      var lastid;
      return function(companyID) {
        lastid = companyID;
        if (lastid) {
          var item = modelSetter.peek();
          if (item && item.CompanyID === lastid) {
            // already loaded
            return;
          }
          // clear before loading new
          modelSetter(null);
          // load new
          loadRep(lastid, function(val) {
            if (val && val.CompanyID === lastid) {
              modelSetter(val);
            }
          });
        } else {
          // clear
          modelSetter(null);
        }
      };
    }

    data.SalesRepId.subscribe(createLoadRepFunc(data.repModel));
    data.TechId.subscribe(createLoadRepFunc(data.tekModel));

    function createFindFunc(modelSetter, idSetter) {
      return function() {
        if (!repFindVm) {
          repFindVm = new RepFindViewModel({});
        }
        options.layersVm.show(repFindVm, function(val) {
          if (val) {
            // set model before setting id to prevent refetching the recruit data
            modelSetter(val);
            idSetter(val.CompanyID);
          }
        });
      };
    }
    var repFindVm;
    data.clickRep = createFindFunc(data.repModel, data.SalesRepId);
    data.clickTek = createFindFunc(data.tekModel, data.TechId);

    return data;
  }

  var dateConverter = ukov.converters.date();
  var boolConverter = ukov.converters.bool();
  var nullStrConverter = ukov.converters.nullString();
  var max256 = ukov.validators.maxLength(256);
  var schema = {
    _model: true,

    ID: {},
    PaymentTypeId: {}, // Billing method
    FriendsAndFamilyTypeId: {},
    AccountSubmitId: {},
    AccountCancelReasonId: {},
    AccountPackageId: {
      validators: [
        ukov.validators.isRequired("Package is required"),
      ]
    },
    TechId: {},
    SalesRepId: {},
    AccountFundingStatusId: {},
    BillingDay: {}, // Billing Day of Month
    Email: {
      converter: nullStrConverter,
      validators: [max256, ukov.validators.isEmail()],
    },
    IsMoni: {},
    SystemTypeId: {}, // (NEW|UPG|TKO) // IsTakeOver: {},
    IsOwner: {},
    InstallDate: {
      converter: dateConverter,
    },
    SubmittedToCSDate: {
      converter: dateConverter,
    },
    CsConfirmationNumber: {},
    CsTwoWayConfNumber: {},
    SubmittedToGPDate: {
      converter: dateConverter,
    },
    ContractSignedDate: {
      converter: dateConverter,
      // validators: [
      //   ukov.validators.isRequired("Contract Date is required"),
      // ]
    },
    CancelDate: {
      converter: dateConverter,
    },
    AMA: {},
    NOC: {},
    SOP: {},
    ApprovedDate: {
      converter: dateConverter,
    },
    ApproverID: {},
    NOCDate: {
      converter: dateConverter,
      // validators: [
      //   ukov.validators.isRequired("NOC Date is required"),
      // ]
    },
    OptOutCorporate: {
      converter: boolConverter,
    },
    OptOutAffiliate: {
      converter: boolConverter,
    },
    AccountCreationTypeId: {},
    HasPackageUpgrades: {},
    ModifiedOn: {},
    ModifiedBy: {},
    CreatedOn: {},
    CreatedBy: {},
  };

  function loadRep(companyId, setter, cb) {
    dataservice.qualify.salesrep.read({
      id: companyId,
    }, setter, cb);
  }

  return salesinfo_model;
});
