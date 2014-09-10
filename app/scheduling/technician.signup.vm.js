define('src/scheduling/technician.signup.vm', [
  'jquery',
  'fullcalendar',
  'src/app',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/combo.vm',
  'src/core/joiner',
  'ko',
  'src/ukov',
], function(
  $,
  fullCalendar,
  app,
  dataservice,
  notify,
  utils,
  BaseViewModel,
  ComboViewModel,
  joiner,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    AvailableStartTime: {},
    AvailableEndTime: {},
    TechnicianId: {}
  };


  function TechSignUpViewModel(options) {
    var _this = this,
      block;

    TechSignUpViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Technician Schedule Block Signup';

    _this.data = ukov.wrap(_this.item || {
      AvailableStartTime: null,
      AvailableEndTime: null
    }, schema);

    //Set values    
    _this.data.AvailableStartTime(_this.stime);
    _this.data.AvailableEndTime(_this.etime);

    if (typeof _this.RuTechnician === "object") {
      _this.data.TechnicianId(_this.RuTechnician.TechnicianId);
    }

    //This is the dropdown for technicians
    _this.data.TechnicianCvm = new ComboViewModel({
      selectedValue: _this.data.TechnicianId,
      fields: {
        value: 'TechnicianId',
        text: 'FullName',
      },
    });

    //
    // events
    //

    _this.cmdSaveAvailability = ko.command(function(cb) {

      console.log("@TODO save signup schedule block...");

      block = (parseInt(_this.blockTime, 10) < 12) ? 'AM' : 'PM';

      //technician validation
      if (!_this.data.TechnicianId()) {
        notify.warn("Please select a technician.", null, 3);
        cb();
        return;
      }
      var param = {
        //'TechnicianId': app.user.peek().GPEmployeeID,
        'TechnicianId': _this.data.TechnicianId(),
        'Block': block,
        'StartTime': _this.data.AvailableStartTime(),
        'EndTime': _this.data.AvailableEndTime(),
        'IsTechConfirmed': true
      };

      //dataservice.scheduleenginesrv.SeTechnicianAvailability.post(null, param, null, utils.safeCallback(cb, function(err, resp) {
      dataservice.scheduleenginesrv.SeScheduleBlock.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {

          console.log("New availability schedule saved:" + JSON.stringify(resp.Value));

          //notify.info("New schedule saved.", null, 3);

          //close popup
          closeLayer(_this);

        } else {
          notify.error(err);
        }

      }));

    });


    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(TechSignUpViewModel, BaseViewModel);
  TechSignUpViewModel.prototype.viewTmpl = 'tmpl-technician-signup';
  TechSignUpViewModel.prototype.width = 400;
  TechSignUpViewModel.prototype.height = 'auto';

  TechSignUpViewModel.prototype.onActivate = function() {
    var _this = this,
      join = joiner();
    load_technicianList(_this.data.TechnicianCvm, join.add());
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TechSignUpViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_technicianList(cvm, cb) {

    dataservice.humanresourcesrv.RuTechnicianList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("RuTechnicianList:" + JSON.stringify(resp.Value));

        //Set result to Location combo list
        cvm.setList(resp.Value);

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }

  return TechSignUpViewModel;
});
