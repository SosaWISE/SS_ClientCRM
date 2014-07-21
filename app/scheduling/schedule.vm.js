define('src/scheduling/schedule.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  //'src/core/layers.vm',
  //'src/core/joiner',
  //'ko',
  //'src/ukov',
], function(
  $,
  fullCalendar,
  dataservice,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel
  //LayersViewModel,
  //joiner,
  //ko,
  //ukov
) {
  "use strict";

  // var schema;

  // schema = {
  //   _model: true,
  //   TicketStatus: {},
  // };


  function ScheduleViewModel(options) {
    var _this = this;

    ScheduleViewModel.super_.call(_this, options);

    // _this.data = ukov.wrap(_this.item || {
    //   TicketStatus: null,
    // }, schema);


    //events
    //

  }

  utils.inherits(ScheduleViewModel, ControllerViewModel);
  ScheduleViewModel.prototype.viewTmpl = 'tmpl-schedule';

  //
  // members
  //

  ScheduleViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    //var _this = this;
    // var sourceFullView = { url: '/Home/GetDiaryEvents/' };
    // var sourceSummaryView = { url: '/Home/GetDiarySummary/' };
    var CalLoading = true;

    join = join;

    console.log($);

    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      defaultView: 'agendaDay',
      editable: true,
      allDaySlot: false,
      selectable: true,
      slotMinutes: 15,
      // events: '/Home/GetDiaryEvents/',
      eventClick: function(calEvent /*, jsEvent, view*/ ) {
        alert('You clicked on event id: ' + calEvent.id + "\nSpecial ID: " + calEvent.someKey + "\nAnd the title is: " + calEvent.title);

      },

      eventDrop: function(event, dayDelta, minuteDelta, allDay, revertFunc) {
        notify.confirm("Confirm move?", "Confirm move?", function(result) {
          if (result === 'yes') {
            updateEvent(event.id, event.start);
          } else {
            revertFunc();
          }
        });
      },

      eventResize: function(event, dayDelta, minuteDelta, revertFunc) {
        notify.confirm("Confirm change appointment length?", "Confirm change appointment length?", function(result) {
          if (result === 'yes') {
            updateEvent(event.id, event.start, event.end);
          } else {
            revertFunc();
          }
        });
      },



      dayClick: function(date /*, allDay, jsEvent, view*/ ) {
        $('#eventTitle').val("");
        $('#eventDate').val($.fullCalendar.formatDate(date, 'dd/MM/yyyy'));
        $('#eventTime').val($.fullCalendar.formatDate(date, 'HH:mm'));
        showEventPopup(date);
      },

      viewRender: function(view /*, element*/ ) {

        if (!CalLoading) {
          if (view.name === 'month') {
            //   $('#calendar').fullCalendar('removeEventSource', sourceFullView);
            $('#calendar').fullCalendar('removeEvents');
            //   $('#calendar').fullCalendar('addEventSource', sourceSummaryView);
          } else {
            //   $('#calendar').fullCalendar('removeEventSource', sourceSummaryView);
            $('#calendar').fullCalendar('removeEvents');
            //   $('#calendar').fullCalendar('addEventSource', sourceFullView);
          }
        }
      }

    });

  };


  function showEventPopup( /*date*/ ) {
    clearPopupFormValues();
    $('#popupEventForm').show();
    $('#eventTitle').focus();
  }

  function clearPopupFormValues() {
    $('#eventID').val("");
    $('#eventTitle').val("");
    $('#eventDateTime').val("");
    $('#eventDuration').val("");
  }

  function updateEvent(EventID, EventStart, EventEnd) {
    var dataRow = {
      'ID': EventID,
      'NewEventStart': EventStart,
      'NewEventEnd': EventEnd
    };

    $.ajax({
      type: 'POST',
      url: "/Home/UpdateEvent",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(dataRow)
    });
  }



  return ScheduleViewModel;
});
