define('src/scheduling/schedule.popup.vm', [
  'jquery',
  'fullcalendar',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  $,
  fullCalendar,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    EventTitle: {
      validators: [
        ukov.validators.isRequired('Event Title is required')
      ]
    },
    EventDate: {},
    EventTime: {},
    EventDuration: {
      converter: ukov.converters.numText(),
    }
  };


  function SchedulePopupViewModel(options) {
    var _this = this;
    SchedulePopupViewModel.super_.call(_this, options);

    //debugging
    console.log("Title:" + _this.ptitle);
    console.log("Date:" + _this.pdate);
    console.log("Time:" + _this.ptime);


    //Set title
    _this.title = _this.title || 'Create New Service Ticket';

    _this.data = ukov.wrap(_this.item || {
      EventTitle: null,
      EventDate: null,
      EventTime: null,
      EventDuration: null,
    }, schema);

    //Set values
    _this.data.EventDate(_this.pdate);
    _this.data.EventTime(_this.ptime);

    //
    // events
    //

    _this.cmdSaveEvent = ko.command(function(cb) {

      var dataRow = {
        'Title': _this.data.EventTitle(),
        'NewEventDate': _this.data.EventDate(),
        'NewEventTime': _this.data.EventTime(),
        'NewEventDuration': _this.data.EventDuration()
      };

      console.log("Ready to save event...");
      console.log("Data to save:" + JSON.stringify(dataRow));

      //Refetch grid
      // $.ajax({
      //     type: 'POST',
      //     url: "/Home/SaveEvent",
      //     data: dataRow,
      //     success: function (response) {
      //         if (response == 'True') {
      //             $('#calendar').fullCalendar('refetchEvents');
      //             alert('New event saved!');
      //         }
      //         else {
      //             alert('Error, could not save event!');
      //         }
      //     }
      // });      

      cb();
    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(SchedulePopupViewModel, BaseViewModel);
  SchedulePopupViewModel.prototype.viewTmpl = 'tmpl-schedule-popup';
  SchedulePopupViewModel.prototype.width = 400;
  SchedulePopupViewModel.prototype.height = 'auto';

  SchedulePopupViewModel.prototype.onActivate = function( /*routeData*/ ) {};

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  SchedulePopupViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return SchedulePopupViewModel;
});
