define('src/account/vm.salesinfo', [
  'src/slick/buttonscolumn',
  'src/slick/vm.slickgrid',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko',
  'src/core/vm.combo',
], function(
  ButtonsColumn,
  SlickGridViewModel,
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  function SalesInfoViewModel(options) {
    var _this = this;
    SalesInfoViewModel.super_.call(_this, options);

    // ** Fields
    _this.activationFee = ko.observable();
    _this.psComboVM = new ComboViewModel({
      fields: {
        text: 'TemplateName',
        value: 'InvoiceTemplateID',
      }
    });
    _this.ctComboVM = new ComboViewModel({
      nullable: true,
      fields: {
        text: 'CellularTypeName',
        value: 'CellularTypeID',
      }
    });
    _this.apckComboVM = new ComboViewModel({
      fields: {
        text: 'PackageName',
        value: 'AlarmComPackageID',
      }
    });
    _this.clComboVM = new ComboViewModel({
      fields: {
        text: 'ContractName',
        value: 'ContractTemplateID',
      }
    });
    _this.title = ko.observable(_this.title);

    _this.frequentGrid = new SlickGridViewModel({
      options: {
        enableColumnReorder: false,
        rowHeight: 27,
      },
      columns: [
        {
          id: 'item',
          name: 'Item',
          field: 'Item',
        },
        {
          id: 'description',
          name: 'Description',
          field: 'Description',
        },
        {
          id: 'price',
          name: 'Price',
          field: 'Price',
          formatter: SlickGridViewModel.formatters.currency,
        },
        {
          id: 'points',
          name: 'Points',
          field: 'Points',
          formatter: SlickGridViewModel.formatters.likecurrency,
        },
        new ButtonsColumn({
          id: 'actions',
          name: 'Actions',
          buttons: [
            {
              text: 'Add',
              fn: function(item) {
                alert('add ' + JSON.stringify(item));
              },
            },
          ]
        }),
      ],
    });
    while (_this.frequentGrid.list().length < 9) {
      _this.frequentGrid.list().push({
        Item: 'Item ' + _this.frequentGrid.list().length,
        Description: 'Description ' + _this.frequentGrid.list().length,
        Price: _this.frequentGrid.list().length * -1.23,
        Points: _this.frequentGrid.list().length - 4,
      });
    }

    _this.psComboVM.selectedValue.subscribe(function(psValue) {
      _this.clComboVM.setList([]);
      dataservice.salessummary.contractlengthsget.read({
        id: psValue,
      }, null, function(err, resp) {
        utils.safeCallback(err, function() {
          // only set cl if same as current selected psValue
          if (_this.psComboVM.selectedValue() === psValue) {
            _this.clComboVM.setList(resp.Value);
          }
        }, function(err) {
          if (err) {
            notify.notify('error', err.Message);
          }
        });
      });
    });

    //
    // events
    //
  }
  utils.inherits(SalesInfoViewModel, ControllerViewModel);
  SalesInfoViewModel.prototype.viewTmpl = 'tmpl-salesinfo';

  SalesInfoViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;
    load_activationFee(_this, join.add());
    load_pointsystems(_this, join.add());
    load_cellulartypes(_this, join.add());
    load_vendoralarmcompacakges(_this, join.add());
  };

  function load_activationFee(_this, cb) {
    _this.activationFee(199.00);
    cb();
  }

  function load_pointsystems(_this, cb) {
    // ** Pull pointsystems
    dataservice.salessummary.pointsystems.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        _this.psComboVM.setList(resp.Value);
        _this.psComboVM.selectItem(_this.psComboVM.list()[0]);
      }, cb);
    });
  }

  function load_cellulartypes(_this, cb) {
    // ** Pull Cellular Types
    dataservice.salessummary.cellulartypes.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        _this.ctComboVM.setList(resp.Value);
      }, cb);
    });
  }

  function load_vendoralarmcompacakges(_this, cb) {
    // ** Pull alarm.com packages
    dataservice.salessummary.vendoralarmcompacakges.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind Data
        _this.apckComboVM.setList(resp.Value);
      }, cb);
    });
  }

  return SalesInfoViewModel;
});
