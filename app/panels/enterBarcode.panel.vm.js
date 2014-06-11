define('src/panels/enterBarcode.panel.vm', [
  'src/account/default/address.validate.vm',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/joiner',
  'src/core/jsonhelpers',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
  //'src/dataservice',
  //'src/core/router',
  //'src/slick/slickgrid.vm',
  //'src/config',
  //'src/slick/rowevent',
  //'src/ukov',
], function(
  AddressValidateViewModel,
  ComboViewModel,
  notify,
  joiner,
  jsonhelpers,
  ko,
  utils,
  ControllerViewModel
  //dataservice
  //router
  //SlickGridViewModel,
  //config,
  //RowEvent,
  //ukov
) {
  "use strict";


  function EnterBarcodeViewModel(options) {
    var _this = this;

    EnterBarcodeViewModel.super_.call(_this, options);

    _this.title = 'Enter Barcodes';


    //events
    //

  }

  utils.inherits(EnterBarcodeViewModel, ControllerViewModel);

  //
  // members
  //

  EnterBarcodeViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me

    join = join;

  };
  EnterBarcodeViewModel.prototype.onActivate = function(routeData) {

    routeData.action = 'barcode';
  };


  return EnterBarcodeViewModel;
});
