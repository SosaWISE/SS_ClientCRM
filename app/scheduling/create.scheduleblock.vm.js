define('src/scheduling/create.scheduleblock.vm', [
  'jquery',
  'fullcalendar',
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
  $,
  fullCalendar,
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
    ScheduleAvailableSlot: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('Please enter # of slot.'),
        ukov.validators.isInt('Please input a number.'),
      ],
    },
    ScheduleZip: {
      validators: [
        ukov.validators.isZipCode('Please enter a valid zip code.'),
        ukov.validators.isRequired('Please enter a zip code.'),
      ],
    },
    ScheduleMaxRadius: {},
    ScheduleDistance: {},
    ScheduleDate: {},
    ScheduleStartTime: {},
    ScheduleEndTime: {},
    TechnicianId: {},
  };


  function ScheduleBlockViewModel(options) {
    var _this = this;
    //join = joiner();

    ScheduleBlockViewModel.super_.call(_this, options);

    //Set the first focus on slot # field
    _this.focusFirst = ko.observable(false);

    //Set title
    _this.title = _this.title || 'Create Schedule Block';

    _this.data = ukov.wrap(_this.item || {
      ScheduleAvailableSlot: null,
      ScheduleZip: null,
      ScheduleMaxRadius: null,
      ScheduleDistance: null,
      ScheduleDate: null,
      ScheduleStartTime: null,
      ScheduleEndTime: null,
      TechnicianId: null,
    }, schema);

    //Set values
    //_this.data.ScheduleDate(_this.date);
    _this.data.ScheduleStartTime(_this.stime);
    _this.data.ScheduleEndTime(_this.etime);
    _this.data.ScheduleAvailableSlot(_this.slot);
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

    _this.cmdSaveBlock = ko.command(function(cb) {

      var block,
        param;

      console.log(_this.blockTime);

      //check am/pm
      block = (parseInt(_this.blockTime, 10) < 12) ? 'AM' : 'PM';


      //check if technician is available
      if (!_this.data.TechnicianId()) {
        notify.warn("Please select a technician.", null, 3);
        cb();
        return;
      }


      param = {
        'BlockID': _this.BlockID,
        'Color': 'white',
        'Block': block,
        'ZipCode': _this.data.ScheduleZip(),
        'MaxRadius': _this.data.ScheduleMaxRadius(),
        'StartTime': _this.data.ScheduleStartTime(),
        'EndTime': _this.data.ScheduleEndTime(),
        'AvailableSlots': _this.data.ScheduleAvailableSlot(),
        'TechnicianId': _this.data.TechnicianId(),
      };

      console.log("Data to save:" + JSON.stringify(param));

      dataservice.scheduleenginesrv.SeZipCode.read({
        id: _this.data.ScheduleZip(),
        link: 'ZC'
      }, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {
          console.log("Checking Zipcode result:" + JSON.stringify(resp.Value));

          //@TODO Save block      
          dataservice.scheduleenginesrv.SeScheduleBlock.save({
            id: _this.BlockID,
            data: param
          }, null, utils.safeCallback(cb, function(err, resp) {

            if (resp.Code === 0) {
              console.log("SeScheduleBlock:" + JSON.stringify(resp.Value));

              //close popup
              closeLayer(_this);

            } else {
              notify.error(err);
            }
          }));

        } else {
          notify.warn("Invalid Zip Code.", null, 3);
        }
      }));

    });

    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the slot#
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(ScheduleBlockViewModel, BaseViewModel);
  ScheduleBlockViewModel.prototype.viewTmpl = 'tmpl-schedule-block';
  ScheduleBlockViewModel.prototype.width = 400;
  ScheduleBlockViewModel.prototype.height = 'auto';

  ScheduleBlockViewModel.prototype.onActivate = function() {
    var _this = this,
      join = joiner();
    load_technicianList(_this.data.TechnicianCvm, join.add());
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  ScheduleBlockViewModel.prototype.getResults = function() {
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

  return ScheduleBlockViewModel;
});
