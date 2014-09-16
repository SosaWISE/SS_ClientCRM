define('src/scheduling/scheduleblock.edit.vm', [
  'src/app',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/combo.vm',
  'src/core/joiner',
  'moment',
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
  moment,
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
    var _this = this,
      join = joiner();

    EditScheduleBlockViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Edit Schedule Block';

    _this.data = ukov.wrap(_this.item || {
      ScheduleEditSlot: null,
      ScheduleEditZip: null,
      ScheduleEditMaxRadius: null,
      ScheduleEditStartDateTime: null,
      ScheduleEditEndDateTime: null,
      TechnicianId: {}
    }, schema);

    //populate fields
    _this.data.ScheduleEditSlot(_this.blockInfo.AvailableSlots);
    _this.data.ScheduleEditZip(_this.blockInfo.ZipCode);
    _this.data.ScheduleEditMaxRadius(_this.blockInfo.MaxRadius);
    _this.data.ScheduleEditStartDateTime(moment(_this.blockInfo.StartTime).format('MM/DD/YYYY HH:mm'));
    _this.data.ScheduleEditEndDateTime(moment(_this.blockInfo.EndTime).format('MM/DD/YYYY HH:mm'));
    _this.data.TechnicianId(_this.blockInfo.TechnicianId);

    //This is the dropdown for technicians
    _this.data.TechnicianCvm = new ComboViewModel({
      selectedValue: _this.data.TechnicianId,
      fields: {
        value: 'TechnicianId',
        text: 'FullName',
      },
    });

    _this.ScheduleEndTime = ko.observable();

    //
    // events
    //

    _this.cmdUpdateBlock = ko.command(function(cb) {


      //@TODO

      //time slots are 1 hour
      if (extendToHour(_this, _this.data.ScheduleEditStartDateTime(), _this.data.ScheduleEditEndDateTime(), join.add())) {

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

      } else {
        cb();
      }

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
      'StartTime': _this.data.ScheduleEditStartDateTime(),
      'EndTime': _this.ScheduleEndTime(),

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

  //time slots are 1 hour
  function extendToHour(_this, start, end, cb) {

    var startDuration,
      endDuration,
      minuteDiff,
      minuteExtra,
      hourDiff;

    //these will do the following - to always achive 1 hour slot implementation

    //when the start dates changes you must also change the end date to match.
    if (moment(start).format('MM/DD/YYYY') !== moment(end).format('MM/DD/YYYY')) {
      end = moment(start).format('MM/DD/YYYY') + " " + moment(end).format('HH') + ":" + moment(end).format('mm');
    }

    // - get moments of start and end time    
    startDuration = moment(start);
    endDuration = moment(end);

    //check if times are valid
    if (!moment(startDuration).isValid()) {
      notify.warn("Start Date & Time is Invalid.", null, 3);
      cb();
      return false;
    }

    if (!moment(endDuration).isValid()) {
      notify.warn("End Date & Time is Invalid.", null, 3);
      cb();
      return false;
    }

    //if user specified hours:minutes for starttime greater than endtime, set the endtime = starttime
    if (moment(startDuration) > moment(endDuration)) {

      endDuration = startDuration;
      hourDiff = 1;

    } else {

      // - get the hour difference
      hourDiff = endDuration.diff(startDuration, 'hour');
      // - get the minute difference
      minuteDiff = endDuration.diff(startDuration, 'minutes');
      // - get the modulo by 60 of minute difference and if greater than 0, add 1/extend to 1 hour
      minuteExtra = minuteDiff % 60;

      if (minuteExtra) {
        hourDiff++;
      }

    }

    //set the final endtime of block
    _this.ScheduleEndTime(moment(startDuration.add("hour", hourDiff)).format("MM/DD/YYYY HH:mm"));

    //set the number of slots for a block, if slot not empty - use what is in the box
    if (!_this.data.ScheduleEditSlot()) {
      _this.data.ScheduleEditSlot(hourDiff);
    }

    return true;

  }

  return EditScheduleBlockViewModel;
});
