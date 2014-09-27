define('src/survey/questionschemas', [
  'src/ukov',
], function(
  ukov
) {
  'use strict';

  var schemas,
    required = ukov.validators.isRequired(),
    max50 = ukov.validators.maxLength(50),
    strConverter = ukov.converters.string(),
    nullStrConverter = ukov.converters.nullString(),
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
    'PrimaryCustomer.FullName': {
      _model: true,
      Prefix: {
        converter: nullStrConverter,
        validators: [max50],
      },
      FirstName: {
        converter: strConverter,
        validators: [
          ukov.validators.isRequired('First name is required'),
          max50
        ],
      },
      MiddleName: {
        converter: nullStrConverter,
        validators: [max50],
      },
      LastName: {
        converter: strConverter,
        validators: [
          ukov.validators.isRequired('Last name is required'),
          max50
        ],
      },
      Postfix: {
        converter: nullStrConverter,
        validators: [max50],
      },
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
