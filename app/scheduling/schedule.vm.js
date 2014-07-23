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
      tSource = [], //temporary list of tickets
      CalLoading = true;

    //create temporary list of tickets
    tSource = [{
      id: 1,
      title: null,
      start: '2014-07-20 01:00',
      allDay: false,
      someInfo: 'AM Block <br/> Zip: 84003 <br /> Max Radius: 30 miles <br /> Distance: 14.99 miles <br /> Available: 0 of 2 <br /><hr> Daniel Ellis (0 of 2) <br />'
    }, {
      id: 2,
      title: null,
      start: '2014-07-21 02:15',
      allDay: false,
      someInfo: 'AM Block <br/> Zip: 84003 <br /> Max Radius: 30 miles <br /> Distance: 14.99 miles <br /> Available: 0 of 2 <br /><hr> Daniel Ellis (0 of 2) <br />'
    }, {
      id: 3,
      title: null,
      start: '2014-07-23 00:30',
      allDay: false,
      someInfo: 'AM Block <br/> Zip: 84003 <br /> Max Radius: 30 miles <br /> Distance: 14.99 miles <br /> Available: 0 of 2 <br /><hr> Daniel Ellis (0 of 2) <br />'
    }];


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
      events: tSource,
      eventColor: '#FACC00',
      eventBackgroundColor: '#FACC00',
      eventBorderColor: '#FACC00',
      eventTextColor: 'white',
      eventClick: function( /*calEvent , jsEvent, view*/ ) {
        //handle click event on tickets
      },

      eventDrop: function(event /*, dayDelta, minuteDelta, allDay, revertFunc*/ ) {
        new UpdateEvent(event.id, event.start);
      },

      eventResize: function(event /*, dayDelta, minuteDelta, revertFunc*/ ) {
        alert("fire");
        new UpdateEvent(event.id, event.start, event.end);
      },

      dayClick: function( /*date , allDay, jsEvent, view*/ ) {

      },

      select: function(start, end /*, jsEvent, view*/ ) {

        _this.layersVm.show(new SchedulePopupViewModel({
          date: $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
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
      },

      //add some more info on events
      eventRender: function(event, element) {
        element.find('.fc-event-title').append("<br/>" + event.someInfo);
      }

    });

  };

  function UpdateEvent(EventID, EventStart, EventEnd) {

    var dataRow = {
      'ID': EventID,
      'NewStartTime': EventStart,
      'NewEndTime': EventEnd
    };

    //@TODO update ticket info
    console.log("Ready to update ticket info:" + JSON.stringify(dataRow));

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
