define('src/account/default/search.vm', [
  'src/account/default/address.validate.vm',
  'src/core/combo.vm',
  'src/dataservice',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  AddressValidateViewModel,
  ComboViewModel,
  dataservice,
  RowEvent,
  SlickGridViewModel,
  ukov,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var acctNumSchema, schema,
    nullStrConverter = ukov.converters.nullString(),
    typeMap;

  acctNumSchema = {
    converter: ukov.converters.numText('Invalid customer number'),
    validators: [
      ukov.validators.isRequired('Please enter a customer number'),
    ],
  };

  schema = {
    _model: true,
    FirstName: {
      converter: nullStrConverter,
    },
    LastName: {
      converter: nullStrConverter,
    },
    PhoneNumber: {
      converter: ukov.converters.phone(),
    },
    City: {
      converter: nullStrConverter,
    },
    StateId: {
      converter: nullStrConverter,
    },
    PostalCode: {
      converter: nullStrConverter,
      validators: [
        ukov.validators.isZipCode(),
      ],
    },
    PageSize: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('Results per Page is required'),
      ],
    },
    PageNumber: {
      converter: ukov.converters.number(0),
    },
  };

  function createType(cls, title) {
    return '<div class="acct-ico ' + cls + '" title="' + title + '"></div>';
  }

  typeMap = {
    LEAD: createType('lead', 'Lead'),

    ALRM: createType('alrm', 'Alarm System'),
    INSEC: createType('insec', 'Internet Security'),
    LFLCK: createType('lflck', 'Life Lock'),
    NUMAN: createType('numan', 'NuManna'),
    PERS: createType('pers', 'GPS Tracking Device'),
    SKPLT: createType('skplt', 'Strick Plate'),
    WNFIL: createType('wnfil', 'Window Film'),
  };

  // ctor
  function SearchViewModel(options) {
    var _this = this;
    SearchViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
    _this.focusFirst = ko.observable(false);
    _this.acctNum = ukov.wrap('', acctNumSchema);
    _this.data = ukov.wrap({
      // only set initial values for PageSize and PageNumber. all other values should be null by default.
      PageSize: 25,
      PageNumber: 1,
    }, schema);
    _this.clearData();
    _this.data.PageSizeCvm = new ComboViewModel({
      selectedValue: _this.data.PageSize,
      list: _this.pageSizeOptions,
    });
    _this.data.StateCvm = new ComboViewModel({
      selectedValue: _this.data.StateId,
      list: AddressValidateViewModel.prototype.stateOptions, //@TODO: load states from server
      nullable: true,
    });

    _this.gvm = new SlickGridViewModel({
      scrollToTop: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(acct) {
            //@HACK: there is an array of AccountTypes, but not an array of FkId. so we're going to assume that
            //       if there is an AccountType of `LEAD` in the array then the FkId is a LeadID........
            console.log(_this);
            if (acct.AccountTypes.some(function(t) {
              return t === 'LEAD';
            })) {
              _this.goTo({
                route: 'leads',
                // id: acct.FkId,
                masterid: acct.CustomerMasterFileID,
              });
            } else {
              _this.goTo({
                route: 'accounts',
                masterid: acct.CustomerMasterFileID,
              });
            }
          },
        }),
      ],
      columns: [ //
        {
          id: 'Icons',
          name: 'Acct Types',
          field: 'AccountTypes',
          width: 50,
          formatter: function(row, cell, value) {
            var results = new Array(value.length);
            value.forEach(function(type, i) {
              results[i] = typeMap[type];
            });
            return results.join('');
          },
        }, {
          id: 'CustomerMasterFileID',
          name: 'CMFID',
          field: 'CustomerMasterFileID',
          width: 30,
        }, {
          id: 'Fullname',
          name: 'Full name',
          field: 'Fullname',
        }, {
          id: 'Phone',
          name: 'Phone',
          field: 'Phone',
          formatter: SlickGridViewModel.formatters.phone,
        }, {
          id: 'City',
          name: 'City',
          field: 'City',
        }, {
          id: 'Email',
          name: 'Email',
          field: 'Email',
        },
      ],
    });
    _this.gvmPages = ko.computed(function() {
      return calculatePages(_this.data.PageNumber());
    });

    //
    // events
    //
    _this.cmdOpenAccount = ko.command(function(cb) {
      _this.openAccount(cb);
    });
    _this.cmdSearch = ko.command(function(cb, vm) {
      _this.search(vm.page, cb);
    });
    _this.clickClear = function() {
      _this.clearData();
      _this.focusFirst(true);
    };

    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(SearchViewModel, ControllerViewModel);
  SearchViewModel.prototype.viewTmpl = 'tmpl-acct-default-search';
  SearchViewModel.prototype.page = 1; // first page. needed in cmdSearch

  SearchViewModel.prototype.pageSizeOptions = [ //
    {
      value: 25,
      text: '25',
    }, {
      value: 50,
      text: '50',
    }, {
      value: 100,
      text: '100',
    },
  ];

  SearchViewModel.prototype.clearData = function() {
    var _this = this,
      data = {
        FirstName: null,
        LastName: null,
        PhoneNumber: null,
        City: null,
        StateId: null,
        PostalCode: null,
        // don't reset PageSize or PageNumber
        // PageSize: 25,
        // PageNumber: 1,
      };
    _this.data.setValue(data);
    _this.data.markClean(data, true);

    _this.acctNum.setValue('');
    _this.acctNum.markClean();
  };
  SearchViewModel.prototype.openAccount = function(cb) {
    var _this = this,
      id;
    if (!_this.acctNum.isValid()) {
      notify.warn(_this.acctNum.errMsg(), null, 5);
    } else {
      id = _this.acctNum.getValue();
      _this.goTo({
        route: 'accounts',
        masterid: id,
      });
      _this.acctNum.markClean(id, true);
    }
    cb();
  };
  SearchViewModel.prototype.search = function(page, cb) {
    var _this = this,
      model;
    if (page < 1) { // don't set to a page less than 1
      cb();
    } else if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
    } else if (_this.data.isClean() && _this.data.PageNumber() === page) {
      // only search if something has changed
      notify.warn('Search criteria hasn\'t changed. No search made.', null, 3);
      cb();
    } else {
      model = _this.data.getValue();
      // set page here instead of on `data` so that the pager isn't updated until the search is done
      model.PageNumber = page;
      // clear grid
      _this.gvm.list([]);
      // do search
      dataservice.accountingengine.customerSearches.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        // update the page number and pager
        _this.data.PageNumber(page);
        // mark search query as the new clean
        _this.data.markClean(model, true);
        // set results in grid
        _this.gvm.list(resp.Value);
        _this.gvm.setSelectedRows([]);
      }, function(err) {
        notify.error(err, 30);
      }));
    }
  };

  function calculatePages(currPage) {
    currPage = currPage || 1;
    // calculate which pages (based on the current page) should show in the pager
    var pages = [],
      pg = currPage - 2,
      endPage = currPage + 3,
      valid;
    // prev page button
    pages.push({
      page: currPage - 1,
      disabled: false,
      text: '<<',
      active: false,
    });
    // add pages
    for (; pg < endPage; pg++) {
      valid = pg >= 1;
      pages.push({
        page: pg,
        disabled: !valid, // disable invalid pages
        text: !valid ? ' ' : pg, // no text for invalid pages
        active: pg === currPage,
      });
    }
    // next page button
    pages.push({
      page: currPage + 1,
      disabled: false,
      text: '>>',
      active: false,
    });
    return pages;
  }

  return SearchViewModel;
});
