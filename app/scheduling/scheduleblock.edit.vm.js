define('src/scheduling/scheduleblock.edit.vm', [
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
    ScheduleEditSlot: {},
    ScheduleEditZip: {},
    ScheduleEditMaxRadius: {},
    TechnicianId: {}
  };


  function EditScheduleBlockViewModel(options) {
    var _this = this;
    EditScheduleBlockViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Edit Schedule Block';

    _this.data = ukov.wrap(_this.item || {
      ScheduleEditSlot: null,
      ScheduleEditZip: null,
      ScheduleEditMaxRadius: null,
      TechnicianId: {}
    }, schema);

    //populate fields
    _this.data.ScheduleEditSlot(_this.blockInfo.NoOfTickets);
    _this.data.ScheduleEditZip(_this.blockInfo.ZipCode);
    _this.data.ScheduleEditMaxRadius(_this.blockInfo.MaxRadius);
    _this.data.TechnicianId(_this.blockInfo.TechnicianId);

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

    _this.cmdUpdateBlock = ko.command(function(cb) {


      //@TODO
      //update block info

      var param = {
        'BlockID': _this.blockInfo.BlockID,
        'ZipCode': _this.data.ScheduleEditZip(),
        'MaxRadius': _this.data.ScheduleEditMaxRadius(),
        'TechnicianId': _this.data.TechnicianId(),
        'AvailableSlots': _this.data.ScheduleEditSlot(),
        'Block': _this.blockInfo.Block,
        'StartTime': _this.blockInfo.StartTime,
        'EndTime': _this.blockInfo.EndTime,
      };

      console.log("Data to save:" + JSON.stringify(param));

      //@TODO Save block info    
      dataservice.scheduleenginesrv.SeScheduleBlock.save({
        id: _this.blockInfo.BlockID,
        data: param
      }, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {
          console.log("Update schedule block:" + JSON.stringify(resp.Value));

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

  utils.inherits(EditScheduleBlockViewModel, BaseViewModel);
  EditScheduleBlockViewModel.prototype.viewTmpl = 'tmpl-schedule-block-edit';
  EditScheduleBlockViewModel.prototype.width = 400;
  EditScheduleBlockViewModel.prototype.height = 'auto';


  EditScheduleBlockViewModel.prototype.onActivate = function() {
    var _this = this,
      join = joiner();
    load_technicianList(_this.data.TechnicianCvm, join.add());
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }

  EditScheduleBlockViewModel.prototype.getResults = function() {
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



  return EditScheduleBlockViewModel;
});
