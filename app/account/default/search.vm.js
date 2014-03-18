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
  var schema,
    nullStrConverter = ukov.converters.nullString();

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
    },
    PageNumber: {
      converter: ukov.converters.number(0),
    },
  };

  function SearchViewModel(options) {
    var _this = this;
    SearchViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({
      PageSize: 25,
      PageNumber: 1,
    }, schema);
    _this.clearData();
    _this.data.PageSizeCvm = new ComboViewModel({
      selectedValue: _this.data.PageSize,
      list: _this.pageSizeOptions,
    });
    _this.data.StateCvm = new ComboViewModel({
      matchStart: true,
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
            _this.goTo({
              route: 'accounts',
              masterid: acct.CustomerMasterFileID,
            });
          },
        }),
      ],
      columns: [
        {
          id: 'Icons',
          name: '',
          field: 'ICONS',
          width: 30,
          formatter: function(row, cell, value) {
            //@TODO: change this when ICONS is no longer html hex codes (eg &#8962;)
            return value;
          },
        },
        {
          id: 'CustomerMasterFileID',
          name: 'CMFID',
          field: 'CustomerMasterFileID',
          width: 30,
        },
        {
          id: 'Fullname',
          name: 'Full name',
          field: 'Fullname',
        },
        {
          id: 'Phone',
          name: 'Phone',
          field: 'Phone',
        },
        {
          id: 'City',
          name: 'City',
          field: 'City',
        },
        {
          id: 'Email',
          name: 'Email',
          field: 'Email',
        },
      ],
    });
    _this.gvmPages = ko.computed(function() {
      // calculate which pages (based on the current page) should show in the footer
      var pages = [],
        currPage = _this.data.PageNumber() || 1,
        startPage = Math.max(1, currPage - 2),
        endPage = currPage + 3;
      for (currPage = startPage; currPage < endPage; currPage++) {
        pages.push(currPage);
      }
      return pages;
    });

    //
    // events
    //
    _this.cmdSearch = ko.command(function(cb) {
      _this.data.PageNumber(1);
      _this.search(cb);
    }, function(busy) {
      return !busy && !_this.cmdPage.busy();
    });
    _this.cmdPage = ko.command(function(cb) {
      var page = this;
      if (page === _this.data.PageNumber.peek()) {
        cb();
        return;
      }
      _this.data.PageNumber(page);
      _this.search(cb);
    }, function(busy) {
      return !busy && !_this.cmdSearch.busy() && _this.data.isValid() && _this.data.isClean();
    });
    _this.clickClear = function() {
      _this.clearData();
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

  SearchViewModel.prototype.pageSizeOptions = [
    {
      value: 25,
      text: '25',
    },
    {
      value: 50,
      text: '50',
    },
    {
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
        // PageSize: 25,
        // PageNumber: 1,
      };
    _this.data.setVal(data);
    _this.data.markClean(data, true);
  };
  SearchViewModel.prototype.search = function(cb) {
    var _this = this,
      model;
    if (!_this.data.isValid()) {
      notify.notify('warn', _this.data.errMsg(), 7);
      cb();
      return;
    }
    model = _this.data.getValue();
    _this.data.markClean(model, true);
    _this.gvm.list([]);
    dataservice.accountingengine.customerSearches.save({
      data: model,
    }, null, utils.safeCallback(cb, function(err, resp) {
      _this.gvm.list(resp.Value);
      _this.gvm.setSelectedRows([]);
    }, function(err) {
      notify.notify('error', err.Message);
    }));
  };

  return SearchViewModel;
});
