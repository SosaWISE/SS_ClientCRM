define('src/scheduling/schedule.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/scheduling/schedule.popup.vm',
  'src/core/layers.vm',
  'src/core/joiner',
  //'ko',
  //'src/ukov',

], function(
  $,
  fullCalendar,
  dataservice,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel,
  SchedulePopupViewModel,
  LayersViewModel,
  joiner
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

    //This a layer for creating new ticket (Pop-up)
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });


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
    join = join;

  };

  ScheduleViewModel.prototype.onActivate = function( /*routeData, extraData, join*/ ) { // override me
    var _this = this,
      join = joiner(),
      tSource = {}, //temporary list of tickets
      CalLoading = true;

    //create temporary list of tickets
    tSource = {
      events: [{
          title: 'Event1',
          start: '2014-07-20'
        }, {
          title: 'Event2',
          start: '2014-07-21'
        }
        // etc...
      ],
      color: 'yellow', // an option!
      textColor: 'black' // an option!
    };

    //load all scheduled tickets
    load_scheduleTickets(join.add());


    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      defaultView: 'agendaWeek',
      editable: true,
      allDaySlot: false,
      selectable: true,
      slotMinutes: 15,
      selectHelper: true,
      //events: '/Home/GetDiaryEvents/',
      events: tSource,
      eventClick: function(calEvent /*, jsEvent, view*/ ) {
        alert('You clicked on event id: ' + calEvent.id + "\nSpecial ID: " + calEvent.someKey + "\nAnd the title is: " + calEvent.title);

      },

      eventDrop: function(event, dayDelta, minuteDelta, allDay, revertFunc) {
        if (this.confirm("Confirm move?")) {
          new UpdateEvent(event.id, event.start);
        } else {
          revertFunc();
        }
      },

      eventResize: function(event, dayDelta, minuteDelta, revertFunc) {

        if (this.confirm("Confirm change appointment length?")) {
          new UpdateEvent(event.id, event.start, event.end);
        } else {
          revertFunc();
        }
      },



      dayClick: function( /*date , allDay, jsEvent, view*/ ) {
        // $('#eventTitle').val("");
        // $('#eventDate').val($.fullCalendar.formatDate(date, 'dd/MM/yyyy'));
        // $('#eventTime').val($.fullCalendar.formatDate(date, 'HH:mm'));
        // new ShowEventPopup(date);

        // _this.layersVm.show(new SchedulePopupViewModel({
        //   ptitle: 'New Service Ticket',
        //   pdate: $.fullCalendar.formatDate(date, 'MM/dd/yyyy'),
        //   ptime: $.fullCalendar.formatDate(date, 'HH:mm'),
        // }), function onClose( /*result*/ ) {
        //     console.log("Refetching tickets...");
        //     $('#calendar').fullCalendar('refetchEvents');
        // });

      },

      select: function(start, end /*, jsEvent, view*/ ) {

        _this.layersVm.show(new SchedulePopupViewModel({
          ptitle: 'New Service Ticket',
          pdate: $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
          stime: $.fullCalendar.formatDate(start, 'HH:mm'),
          etime: $.fullCalendar.formatDate(end, 'HH:mm'),
        }), function onClose( /*result*/ ) {
          console.log("Refetching tickets...");
          $('#calendar').fullCalendar('refetchEvents');
        });
      },

      viewRender: function(view /*, element*/ ) {

        if (!CalLoading) {
          if (view.name === 'month') {
            //   $('#calendar').fullCalendar('removeEventSource', sourceFullView);
            //$('#calendar').fullCalendar('removeEvents');
            //   $('#calendar').fullCalendar('addEventSource', sourceSummaryView);
          } else {
            //   $('#calendar').fullCalendar('removeEventSource', sourceSummaryView);
            //$('#calendar').fullCalendar('removeEvents');
            //   $('#calendar').fullCalendar('addEventSource', sourceFullView);
          }
        }
      }

    });

  };


  // function ShowEventPopup( /*date*/ ) {    
  //   new ClearPopupFormValues();
  //   $('#popupEventForm').show();
  //   $('#eventTitle').focus();
  // }

  // function ClearPopupFormValues() {
  //   $('#eventID').val("");
  //   $('#eventTitle').val("");
  //   $('#eventDateTime').val("");
  //   $('#eventDuration').val("");
  // }

  function UpdateEvent(EventID, EventStart, EventEnd) {

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


  function load_scheduleTickets(cb) {

    //temporary date range
    var param = {
      AppointmentDateStart: '07/21/2014',
      AppointmentDateEnd: '07/26/2014'
    };

    dataservice.scheduleenginesrv.SeScheduleTicketList.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("SeScheduleTicketList:" + JSON.stringify(resp.Value));

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }


  return ScheduleViewModel;
});
