define('src/survey/questionschemas', [
  'src/ukov',
], function(
  ukov
) {
  'use strict';

  var schemas,
    required = ukov.validators.isRequired(),
    emailSchema;

  emailSchema = {
    converter: ukov.converters.string(),
    validators: [
      required,
      ukov.validators.isEmail(),
    ],
  };

  schemas = {
    'default': {
      validators: [required],
    },
    'PrimaryCustomer.Email': emailSchema,
    'SystemDetails.Password': {
      converter: ukov.converters.string(),
      validators: [
        required,
        //????
      ],
    },
    'ContractTerms.BillingDate': {
      converter: ukov.converters.number(0),
      validators: [
        required,
        ukov.validators.isInRange(1, 25, 'Billing date must be between the {0:th} and {1:th}'),
      ],
    },
  };

  return schemas;
});
