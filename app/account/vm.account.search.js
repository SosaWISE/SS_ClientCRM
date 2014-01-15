define('src/account/vm.account.search', [
  'src/slick/rowevent',
  'src/slick/vm.slickgrid',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  RowEvent,
  SlickGridViewModel,
  ukov,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var count = 4,
    schema,
    strConverter = ukov.converters.string();

  schema = {
    _model: true,
    AccountId: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isInt(0),
      ],
    },
    CaseId: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isInt(0),
      ],
    },
    FirstName: {
      converter: strConverter,
    },
    LastName: {
      converter: strConverter,
    },
    DOB: {
      converter: ukov.converters.date(),
    },
    Phone: {
      converter: ukov.converters.phone(),
    },
    CSID: {
      // IndustryNumber
      converter: strConverter,
    },
    Email: {
      converter: strConverter,
      validators: [
        ukov.validators.isEmail(),
      ],
    },
    Address: {
      converter: strConverter,
    },
    City: {
      converter: strConverter,
    },
    State: {
      converter: strConverter,
    },
    Zip: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isZipCode(),
      ],
    },
  };

  function SearchAccountViewModel(options) {
    var _this = this;
    SearchAccountViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);

    _this.data = ukov.wrap({
      AccountId: '',
      CaseId: '',
      FirstName: '',
      LastName: '',
      DOB: '',
      Phone: '',
      CSID: '',
      Email: '',
      Address: '',
      City: '',
      State: '',
      Zip: '',
    }, schema);


    _this.searchGvm = new SlickGridViewModel({
      options: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(acct) {
            _this.goTo({
              route: 'accounts',
              masterid: acct.CustomerMasterAccountID,
            });
          },
        }),
      ],
      columns: [
        {
          id: 'CustomerMasterAccountID',
          name: 'Master ID',
          field: 'CustomerMasterAccountID',
        },
        {
          id: 'PrimaryCustomer',
          name: 'PrimaryCustomer',
          field: 'PrimaryCustomer',
        },
        {
          id: 'SecondaryCustomer',
          name: 'SecondaryCustomer',
          field: 'SecondaryCustomer',
        },
        {
          id: 'PremisePhone',
          name: 'PremisePhone',
          field: 'PremisePhone',
        },
        {
          id: 'StreetAddress',
          name: 'StreetAddress',
          field: 'StreetAddress',
        },
        {
          id: 'City',
          name: 'City',
          field: 'City',
        },
        {
          id: 'State',
          name: 'State',
          field: 'State',
        },
      ],
    });
    while (_this.searchGvm.list().length < 19) {
      _this.searchGvm.list().push({
        CustomerMasterAccountID: 3000000 + (_this.searchGvm.list().length + 1),
        PrimaryCustomer: 'PrimaryCustomer' + (_this.searchGvm.list().length + 1),
        SecondaryCustomer: 'SecondaryCustomer' + (_this.searchGvm.list().length + 1),
        PremisePhone: 'PremisePhone' + (_this.searchGvm.list().length + 1),
        StreetAddress: 'StreetAddress' + (_this.searchGvm.list().length + 1),
        City: 'City' + (_this.searchGvm.list().length + 1),
        State: 'State' + (_this.searchGvm.list().length + 1),
      });
    }

    //
    // events
    //
    _this.clickOpen = function() {
      _this.goTo({
        id: 100000 + count,
      });
      count++;
    };
  }
  utils.inherits(SearchAccountViewModel, ControllerViewModel);
  SearchAccountViewModel.prototype.viewTmpl = 'tmpl-account_search';

  return SearchAccountViewModel;
});
