define("src/account/salesinfo/v02/contract.model", [
  "ko",
  "src/ukov",
  "src/core/combo.vm",
  "src/core/joiner",
  "src/core/utils",
], function(
  ko,
  ukov,
  ComboViewModel,
  joiner,
  utils
) {
  "use strict";

  function contract_model(options) {
    utils.assertProps(options, [
      "layersVm",
      // "handler",
    ]);
    // var handler = options.handler;

    var data = ukov.wrap({
      ID: 0,
      ModifiedOn: new Date(),
    }, schema);

    data.ContractTemplateCvm = new ComboViewModel({
      selectedValue: data.ContractTemplateId,
      fields: {
        text: "ContractName",
        value: "ContractTemplateID",
      },
    });

    // data.load = function(cb) {
    //   var join = joiner().after(cb);
    //   mscache.ensure("contracts/items", join.add());
    // };

    return data;
  }

  var schema = {
    _model: true,

    ID: {},
    ContractTemplateId: {
      validators: [
        ukov.validators.isRequired("Contract is required"),
      ],
    },
    ModifiedOn: {},
  };

  return contract_model;
});
