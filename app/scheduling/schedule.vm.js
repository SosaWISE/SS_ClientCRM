define('src/scheduling/schedule.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/scheduling/create.scheduleblock.vm',
  'src/scheduling/create.scheduleticket.vm',
  'src/core/layers.vm',
  'src/core/joiner',
  'ko',
  'src/ukov'

], function(
  $,
  fullCalendar,
  dataservice,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel,
  ScheduleBlockViewModel,
  ScheduleTicketViewModel,
  LayersViewModel,
  joiner,
  ko,
  ukov
) {
  'use strict';

  var schema;

  schema = {
    _model: true,
    Ticket: {}
  };


  function ScheduleViewModel(options) {
    var _this = this;

    // console.log(options);
    //alert("schedule vm active");
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

  //ScheduleViewModel.prototype.onActivate = function( /*routeData, extraData, join*/ ) { // override me
  ScheduleViewModel.prototype.onActivate = function(routeData) { // override me

    var _this = this,
      join = joiner();
    //CalLoading = true;

    //console.log(_this);
    //console.log("routeData");

    //alert("schedule vm onactivate");
    //console.log(routeData.ticketid);
    //console.log(routeData);
    //console.log(routeData.extraData);

    _this.data = ukov.wrap({
      Ticket: routeData.extraData.ticket,
    }, schema);

    alert(JSON.stringify(_this.data.getValue()));

    //alert(routeData.ticketid);
    // _this.title = routeData.ticketid;

    //load block list    
    load_scheduleBlockList(join.add());

    /** Fullcalendar plugin **/
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
      aspectRatio: 2.1,
      //events: tSource,
      hiddenDays: [0], //hide sunday      
      eventClick: function(calEvent /*, jsEvent, view*/ ) {

        //console.log(parseInt(calEvent.nTickets, 10) < parseInt(calEvent.slot, 10));

        //show create ticket screen only when there are still spaces available for a specific block
        if (parseInt(calEvent.nTickets, 10) < parseInt(calEvent.slot, 10)) {
          _this.layersVm.show(new ScheduleTicketViewModel({
            date: $.fullCalendar.formatDate(calEvent.start, 'MM/dd/yyyy'),
            blockId: calEvent.id,
          }), function onClose(cb) {
            load_scheduleBlockList(cb);
          });
        }

      },

      eventDrop: function(event /*, dayDelta, minuteDelta, allDay, revertFunc*/ ) {
        new UpdateEvent(event.id, event.start, event.end);
      },

      eventResize: function(event /*, dayDelta, minuteDelta, revertFunc*/ ) {
        new UpdateEvent(event.id, event.start, event.end);
      },

      dayClick: function( /*date , allDay, jsEvent, view*/ ) {

      },

      select: function(start, end /*, jsEvent, view*/ ) {

        _this.layersVm.show(new ScheduleBlockViewModel({
          date: $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
          stime: $.fullCalendar.formatDate(start, 'MM/dd/yyyy HH:mm'),
          etime: $.fullCalendar.formatDate(end, 'MM/dd/yyyy HH:mm'),
          blockTime: $.fullCalendar.formatDate(end, 'HH:mm'),
        }), function onClose(cb) {
          load_scheduleBlockList(cb);
        });
      },

      viewRender: function( /*view, element*/ ) {

        // if (!CalLoading) {
        //   if (view.name === 'month') {
        //     //   $('#calendar').fullCalendar('removeEventSource', sourceFullView);
        //     //$('#calendar').fullCalendar('removeEvents');
        //     //   $('#calendar').fullCalendar('addEventSource', sourceSummaryView);
        //   } else {
        //     //   $('#calendar').fullCalendar('removeEventSource', sourceSummaryView);
        //     //$('#calendar').fullCalendar('removeEvents');
        //     //   $('#calendar').fullCalendar('addEventSource', sourceFullView);
        //   }
        // }
      },

      //add some more info on blocks
      eventRender: function(event, element) {
        element.find('.fc-event-title').append('<br/>' + event.someInfo);
      }

    });

  };

  function UpdateEvent(EventID, EventStart, EventEnd) {

    var block,
      param;

    block = (parseInt($.fullCalendar.formatDate(EventEnd, 'HH:mm'), 10) < 12) ? 'AM' : 'PM';

    //console.log("Block to update:" + block);

    param = {
      'BlockID': EventID,
      'Block': block,
      'StartTime': $.fullCalendar.formatDate(EventStart, 'MM/dd/yyyy HH:mm'),
      'EndTime': $.fullCalendar.formatDate(EventEnd, 'MM/dd/yyyy HH:mm'),
    };

    //@TODO update block info
    // console.log("Updating block info:" + JSON.stringify(param));

    dataservice.scheduleenginesrv.SeScheduleBlock.post(EventID, param, null, utils.safeCallback(null, function( /*err, resp*/ ) {
      //console.log("Block updated:" + JSON.stringify(resp.Value));
      //reload all blocks
      load_scheduleBlockList();

    }, notify.error, false));


  }


  function load_scheduleBlockList(cb) {

    var current = new Date(), // get current date    
      weekstart = current.getDate() - current.getDay() + 1,
      weekend = weekstart + 5, // end day 5 for saturday 
      start = new Date(current.setDate(weekstart)),
      end = new Date(current.setDate(weekend)),
      param,
      x,
      tColor,
      slotAvailable,
      numTickets,
      data = {},
      result = [];

    param = {
      'DateFrom': $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
      'DateTo': $.fullCalendar.formatDate(end, 'MM/dd/yyyy')
    };

    //console.log("Date range:" + JSON.stringify(param));

    dataservice.scheduleenginesrv.SeScheduleBlockList.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        //console.log("SeScheduleBlockList:" + JSON.stringify(resp.Value));

        for (x = 0; x < resp.Value.length; x++) {

          //color coding blocks
          slotAvailable = resp.Value[x].AvailableSlots;
          numTickets = (resp.Value[x].NoOfTickets === null) ? 0 : resp.Value[x].NoOfTickets;

          /**
          White – The entire block is free to schedule a service
          Blue – There is tickets scheduled in the block and there are spaces still available
          Red – The block cannot be scheduled in unless there is a manager override
          Orange – The block is completely full and will not allow further tickets to be scheduled
          **/

          if (numTickets > 0 && numTickets < slotAvailable) {
            tColor = 'skyblue';
          } else if (numTickets >= slotAvailable) {
            tColor = 'orange';
          } else {
            tColor = 'white';
          }

          //objects to display on scheduler grid
          data = {
            id: resp.Value[x].BlockID,
            title: null,
            start: resp.Value[x].StartTime,
            end: resp.Value[x].EndTime,
            slot: slotAvailable,
            nTickets: numTickets,
            allDay: false,
            someInfo: '' + resp.Value[x].Block + ' Block <br/> Zip: ' + resp.Value[x].ZipCode + ' <br /> Max Radius: ' + resp.Value[x].MaxRadius + ' miles <br /> Distance: ' + resp.Value[x].Distance + ' miles <br /> Available: ' + numTickets + ' of ' + resp.Value[x].AvailableSlots + ' <br /><hr> Daniel Ellis (0 of 2) <br />',
            backgroundColor: tColor,
          };

          //list of blocks from server
          result.push(data);

        }

        //console.log("Final Source:" + JSON.stringify(result));

        $('#calendar').fullCalendar('removeEvents');

        $('#calendar').fullCalendar('addEventSource', result);

      } else {
        notify.error(err);
      }
    }));

  }


  return ScheduleViewModel;
});
