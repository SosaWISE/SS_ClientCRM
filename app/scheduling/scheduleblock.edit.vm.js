define('src/scheduling/scheduleblock.edit.vm', [
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
    ScheduleEditSlot: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isInt(),
      ],
    },
    ScheduleEditZip: {
      converter: ukov.converters.nullString(),
      validators: [
        ukov.validators.isZipCode(),
      ],
    },
    ScheduleEditMaxRadius: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isInt(),
      ],
    },
    ScheduleEditStartDateTime: {},
    ScheduleEditEndDateTime: {},
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
    _this.data.ScheduleEditSlot(_this.blockInfo.AvailableSlots);
    _this.data.ScheduleEditZip(_this.blockInfo.ZipCode);
    _this.data.ScheduleEditMaxRadius(_this.blockInfo.MaxRadius);
    //_this.data.ScheduleEditStartDateTime($.fullCalendar.formatDate(_this.blockInfo.StartTime, 'MM/dd/yyyy HH:mm'));
    //_this.data.ScheduleEditEndDateTime($.fullCalendar.formatDate(_this.blockInfo.EndTime, 'MM/dd/yyyy HH:mm'));
    _this.data.ScheduleEditStartDateTime(_this.blockInfo.StartTime);
    _this.data.ScheduleEditEndDateTime(_this.blockInfo.EndTime);
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
      //check zip code

      dataservice.scheduleenginesrv.SeZipCode.read({
        id: _this.data.ScheduleEditZip(),
        link: 'ZC'
      }, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {
          console.log("Checking Zipcode result:" + JSON.stringify(resp.Value));

          updateBlockInfo(_this, cb);
        } else {
          notify.warn("Invalid Zip Code.", null, 3);
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

  function updateBlockInfo(_this, cb) {

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
  }



  return EditScheduleBlockViewModel;
});
