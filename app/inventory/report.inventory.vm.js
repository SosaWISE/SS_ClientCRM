define('src/inventory/report.inventory.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
  'src/inventory/inventory-report-items.gvm',
  'src/inventory/report.inventory.display.vm',
  'src/core/layers.vm',
  'src/core/joiner',
  'src/core/router',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ControllerViewModel,
  InventoryItemsReportGridViewModel,
  DisplayReportInventoryViewModel,
  LayersViewModel,
  joiner,
  router,
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

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });


    _this.data.LocationTypeCvm = new ComboViewModel({
      selectedValue: _this.data.LocationType,
      fields: {
        value: 'LocationTypeID',
        text: 'LocationTypeName',
      },
    });


    //Pre-populated with dummy data for now
    // _this.data.LocationTypeCvm = new ComboViewModel({      
    //   selectedValue: _this.data.LocationType,      
    //   list: [
    //     {
    //       value: 1,
    //       text: 'LocationType1',
    //     }, {
    //       value: 2,
    //       text: 'LocationType2',
    //     },
    //   ],
    // });

    _this.data.LocationCvm = new ComboViewModel({
      selectedValue: _this.data.LocationData,
      list: [{
        value: 1,
        text: 'Location1',
      }, {
        value: 2,
        text: 'Location2',
      }, ],
    });

    //Display Inventory Grid
    _this.itemListGvm = new InventoryItemsReportGridViewModel({

    });

    //Fire up display page
    _this.cmdDisplay = ko.command(function(cb) {

      _this.layersVm.show(new DisplayReportInventoryViewModel({
        title: 'Report',
      }), function onClose(result) {
        if (!result) {
          return;
        }
      });

      cb();

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
    var _this = this;
    join = join;

    load_locationTypeList(_this.data.LocationTypeCvm, join.add());

  };

  //load LocationTypeList
  function load_locationTypeList(cvm, cb) {

    dataservice.inventoryenginesrv.LocationTypeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("LocationTypeList:" + JSON.stringify(resp.Value));

        //Set result to Location combo list
        var x,
          data = [],
          locList = resp.Value;

        for (x = 0; x < locList.length; x++) {
          data.push({
            LocationTypeID: locList[x].LocationTypeID,
            LocationTypeName: locList[x].LocationTypeName,
          });
        }

        cvm.setList(data);

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }

  return ReportInventoryViewModel;
});
