define('src/inventory/report.inventory.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
  'src/inventory/inventory-report-scanned.gvm',
  'src/inventory/inventory-report-unscanned.gvm',
  'src/core/joiner',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ControllerViewModel,
  InventoryReportScannedGridViewModel,
  InventoryReportUnScannedGridViewModel,
  joiner,
  ko,
  ukov
) {
  "use strict";

  var schema = {
    _model: true,
    LocationType: {},
    LocationData: {},
  };



  function ReportInventoryViewModel(options) {
    var _this = this;

    ReportInventoryViewModel.super_.call(_this, options);

    _this.data = ukov.wrap(_this.item || {
      LocationType: null,
      LocationData: null
    }, schema);    

  
    // _this.data.LocationCvm = new ComboViewModel({
    //   selectedValue: _this.data.TransferLocation,
    //   fields: {
    //     value: 'WarehouseSiteID',
    //     text: 'WarehouseSiteName',
    //   },
    // });


    //Pre-populated with dummy data for now
    _this.data.LocationTypeCvm = new ComboViewModel({      
      selectedValue: _this.data.LocationType,      
      list: [
        {
          value: 1,
          text: 'LocationType1',
        }, {
          value: 2,
          text: 'LocationType2',
        },
      ],
    });

    _this.data.LocationCvm = new ComboViewModel({      
      selectedValue: _this.data.LocationData,      
      list: [
        {
          value: 1,
          text: 'Location1',
        }, {
          value: 2,
          text: 'Location2',
        },
      ],
    });    

    //Display Inventory Grids
    _this.scannedListGvm = new InventoryReportScannedGridViewModel({  

    });

    _this.unScannedListGvm = new InventoryReportUnScannedGridViewModel({  

    });    

    //events
    //

    //  _this.active.subscribe(function(active) {
    //   if (active) {
    //     // this timeout makes it possible to focus the barcode field
    //     setTimeout(function() {
    //       _this.focusFirst(true);
    //     }, 100);
    //   }
    // });

  }

  utils.inherits(ReportInventoryViewModel, ControllerViewModel);
  ReportInventoryViewModel.prototype.viewTmpl = 'tmpl-inventory-report';

  //
  // members
  //

  ReportInventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    //var _this = this;
    join = join;
  };

  return ReportInventoryViewModel;
});
