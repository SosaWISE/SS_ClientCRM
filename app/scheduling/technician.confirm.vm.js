define('src/scheduling/technician.confirm.vm', [
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  //-'src/ukov',
], function(
  dataservice,
  notify,
  utils,
  BaseViewModel,
  ko
  //ukov
) {
  "use strict";

  // var schema;

  // schema = {
  //   _model: true
  // };


  function TechConfirmViewModel(options) {
    var _this = this;
    TechConfirmViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Confirm Technician Availability';

    // _this.data = ukov.wrap(_this.item || {      
    // }, schema);


    //
    // events
    //

    _this.cmdTechConfirm = ko.command(function(cb) {

      dataservice.scheduleenginesrv.SeScheduleBlock.save({
        id: _this.BlockID,
        link: 'SSBID'
      }, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {

          console.log("SeScheduleBlock info:" + JSON.stringify(resp.Value));

          var data = resp.Value;

          data.IsTechConfirmed = true;

          if (_this.tColor === "green" || _this.tColor === "#C9FFD7") {
            data.IsRed = true;
          } else if (_this.tColor === "red" || _this.tColor === "#FFBAC2") {
            data.IsRed = false;
          } else {
            data.IsRed = true;
          }

          console.log("SeScheduleBlock info updated:" + JSON.stringify(data));

          updateScheduleBlockInfo(_this, data);
        }

      }));

    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(TechConfirmViewModel, BaseViewModel);
  TechConfirmViewModel.prototype.viewTmpl = 'tmpl-technician-confirm-availability';
  TechConfirmViewModel.prototype.width = 400;
  TechConfirmViewModel.prototype.height = 'auto';

  TechConfirmViewModel.prototype.onActivate = function( /*routeData*/ ) {

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TechConfirmViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function updateScheduleBlockInfo(_this, pData) {

    console.log("BlockID:" + pData.BlockID);
    console.log("pData:" + JSON.stringify(pData));

    dataservice.scheduleenginesrv.SeScheduleBlock.save({
      id: pData.BlockID,
      data: pData
    }, null, utils.safeCallback(null, function(err, resp) {

      console.log(JSON.stringify(resp.Value));

      notify.info("Schedule Availability confirmed.", null, 3);
      closeLayer(_this);

    }, function(err) {
      notify.error(err);
    }));

  }

  return TechConfirmViewModel;
});
