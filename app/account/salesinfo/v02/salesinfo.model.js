define("src/account/salesinfo/v02/salesinfo.model", [
  "src/account/default/rep.find.vm",
  "src/account/salesinfo/options",
  "src/account/mscache",
  "dataservice",
  "ko",
  "src/ukov",
  "src/core/combo.vm",
  "src/core/joiner",
  "src/core/utils",
], function(
  RepFindViewModel,
  salesInfoOptions,
  mscache,
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

    var data = ukov.wrap({
      RequirePkg: !!options.requirePkg,
      UseRequired: !!options.useRequired,
      LimitPaymentTypes: !!options.limitPaymentTypes,
      RMRPaidInFullId: options.RMRPaidInFullId || 'PM',
    }, schema);
    data.RequirePkg.ignore(true);
    data.UseRequired.ignore(true);

    data.AccountCreationTypeCvm = new ComboViewModel({
      selectedValue: data.AccountCreationTypeId,
      fields: mscache.metadata("accountCreationTypes"),
    }).subscribe(mscache.getList("accountCreationTypes"), handler);
    data.showExistingEquipment = ko.computed(function() {
      return data.AccountCreationTypeCvm.selectedValue() === "TKO";
    });

    data.PaymentTypeCvm = new ComboViewModel({
      selectedValue: data.PaymentTypeId,
      fields: mscache.metadata("paymentTypes"),
    }).subscribe(mscache.getList("paymentTypes"), handler);

    data.FriendsAndFamilyTypeCvm = new ComboViewModel({
      selectedValue: data.FriendsAndFamilyTypeId,
      fields: mscache.metadata("types/friendsAndFamily"),
    }).subscribe(mscache.getList("types/friendsAndFamily"), handler);

    data.RmrPaidInFullCvm = new ComboViewModel({
      selectedValue: data.RMRPaidInFullId,
      list: salesInfoOptions.isRMRPaidInFull,
    });

    data.BillingDayCvm = new ComboViewModel({
      selectedValue: data.BillingDay,
      list: salesInfoOptions.billingDays,
    });

    data.AccountPackageCvm = new ComboViewModel({
      selectedValue: data.AccountPackageId,
      fields: mscache.metadata("packages"),
    }).subscribe(mscache.getList("packages"), handler);
    data.HasPackageUpgradesCvm = new ComboViewModel({
      selectedValue: data.HasPackageUpgrades,
      fields: options.yesNoOptions,
    });

    data.load = function(cb) {
      var join = joiner().after(cb);
      mscache.ensure("accountCreationTypes", join.add());
      mscache.ensure("paymentTypes", join.add());
      mscache.ensure("types/friendsAndFamily", join.add());
      mscache.ensure("packages", join.add());
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
  var achValidationGroup = {
    keys: ["LimitPaymentTypes", "PaymentTypeId"],
    validators: [],
  };
  var schema = {
    _model: true,
    RequirePkg: {},
    UseRequired: {},
    LimitPaymentTypes: {
      validationGroup: achValidationGroup,
    },

    ID: {},
    PaymentTypeId: {
      validationGroup: achValidationGroup,
      validators: [
        ukov.validators.isRequired(),
        // ukov.validators.isInRange(0, 999, "Invalid amount"),
        function(val, model) {
          if (model.LimitPaymentTypes &&
            (val === "CHCK" || val === "MAN")) {
            return "Billing method not allowed for poor and sub credit scores";
          }
        }
      ],
    }, // Billing method
    FriendsAndFamilyTypeId: {},
    RMRPaidInFullId: {
      validators: [
        ukov.validators.isRequired("MMR Paid Over is required."),
      ]
    },
    AccountSubmitId: {},
    AccountCancelReasonId: {},
    AccountPackageId: {
      validators: [
        ukov.validators.isRequired("Package is required"),
      ]
    },
    // PaymentMethodId: {}, // cannot edit this directly
    // InitialPaymentMethodId: {}, // cannot edit this directly
    TechId: {},
    SalesRepId: {},
    AccountFundingStatusId: {},
    AccountPayoutTypeId: {},
    BillingDay: {}, // Billing Day of Month
    Email: {
      converter: nullStrConverter,
      validators: [max256, ukov.validators.isEmail()],
    },
    IsMoni: {},
    IsTakeOver: {},
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
      validators: [
        ukov.validators.maybeRequired("Contract Date is Required", "UseRequired"),
      ]
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
      validators: [
        ukov.validators.maybeRequired("NOC Date is Required", "UseRequired"),

      ]
    },
    OptOutCorporate: {
      converter: boolConverter,
    },
    OptOutAffiliate: {
      converter: boolConverter,
    },
    Waived1stmonth: {},
    RMRIncreasePoints: {},
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