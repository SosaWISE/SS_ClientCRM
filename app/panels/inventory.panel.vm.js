define('src/panels/inventory.panel.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
  'ko',
  'src/ukov',  
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ControllerViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;

    schema = {
    _model: true,
    TransferLocation: {},
  };


  function InventoryViewModel(options) {
    var _this = this;

    InventoryViewModel.super_.call(_this, options);
    /*BaseViewModel.ensureProps(_this, [      
      'accountId',
      'monitoringStationOS',
    ]);    
*/
    _this.title = 'Inventory';

    _this.data = ukov.wrap(_this.item || {
      TransferLocation: null,
    }, schema);    

    _this.data.TransferLocationCvm = new ComboViewModel({
      selectedValue: _this.data.TransferLocation,
      //fields: {
        //value: 'TransferLocationId',
        //text: 'Location',
        //nullable: true,
        list: [ //
          {
            value: 1,
            text: '1',
          }, {
            value: 2,
            text: '2',
          },
        ],        
      //},
    });    

    //events
    //

  }

  utils.inherits(InventoryViewModel, ControllerViewModel);

  //
  // members
  //

  InventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;

    load_transferLocations(_this.data.TransferLocationCvm, join.add());    

  };


function load_transferLocations(cvm, cb) {
    dataservice.humanresourcesrv.RuTeamLocationList.read(utils.safeCallback(cb, function(err, resp) {
      
      if (resp.Code === 0) {
          cvm.setList(resp.Value); 
      }

    }, function(err) {
      notify.notify('error', err.Message);
    }));  
}


/*
function readMonitoringStationOS(cvm, id, link, query, cb) {
    dataservice.msaccountsetupsrv.monitoringStationOS.read({
      id: id,
      link: link,
      query: query,
    }, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);      
    }, utils.no_op));
}
*/

  return InventoryViewModel;
});
