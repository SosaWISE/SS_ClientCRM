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
  'src/scheduling/scheduleblock.edit.vm',
  'src/scheduling/scheduleblock.viewticket.vm',
  'src/scheduling/scheduleblock.unscheduleticket.vm',
  'src/core/layers.vm',
  'src/core/joiner',
  'moment',
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
  EditScheduleBlockViewModel,
  ScheduleBlockTicketsViewModel,
  UnScheduleTicketViewModel,
  LayersViewModel,
  joiner,
  moment,
  ko,
  ukov
) {
  'use strict';

  var schema;

  schema = {
    _model: true,
    Ticket: {},
    ScheduleBlockList: {},
    CalendarWeekStart: {},
    CalendarWeekEnd: {}
  };


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

    // now scheduling info
    _this.IsNowScheduling = ko.observable(true);
    _this.AccountMasterFileNumber = ko.observable();
    _this.AccountNumber = ko.observable();
    _this.AccountName = ko.observable();
    _this.AccountAddress = ko.observable();

    //blocks date and time    
    _this.ScheduleEndTime = ko.observable();
    _this.ScheduleAvailableSlot = ko.observable();

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

    _this.data = ukov.wrap({
      Ticket: routeData.extraData.ticket
    }, schema);

    console.log(_this.data.getValue());

    if (_this.data.getValue().Ticket) {

      _this.IsNowScheduling(true);

      if (_this.data.getValue().Ticket.CustomerMasterFileId) {
        _this.AccountMasterFileNumber("Customer Master File#: " + _this.data.getValue().Ticket.CustomerMasterFileId + ' ');
      }

      if (_this.data.getValue().Ticket.AccountId) {
        _this.AccountNumber("Account ID: " + _this.data.getValue().Ticket.AccountId + ' ');
      }

      if (_this.data.getValue().Ticket.CustomerFullName) {
        _this.AccountName("Name: " + _this.data.getValue().Ticket.CustomerFullName + ' ');
      }

      if (_this.data.getValue().Ticket.CompleteAddress) {
        _this.AccountAddress("Address: " + _this.data.getValue().Ticket.CompleteAddress + ' ');
      }

    } else {
      _this.IsNowScheduling(false);
    }

    //load block list    
    load_scheduleBlockList(_this, join.add());

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
      minTime: 8, //start at 8am      
      eventClick: function(calEvent /*, jsEvent, view*/ ) {

        //prevent adding tickets if no zipcode specified on the block
        if (!calEvent.zipCode) {
          notify.warn("Please provide 'zip code' on this block.", null, 3);
          return;
        }

        //show create ticket screen only when there are still spaces available for a specific block
        if (parseInt(calEvent.nTickets, 10) < parseInt(calEvent.slot, 10)) {

          var model = _this.data.getValue();

          _this.layersVm.show(new ScheduleTicketViewModel({
            date: $.fullCalendar.formatDate(calEvent.start, 'MM/dd/yyyy'),
            blockId: calEvent.id,
            ticket: model.Ticket
          }, {
            Ticket: model.Ticket
          }), function onClose(result, cb) {

            //clear ticket data from accounts
            if (result) {
              if (result.AccountTicket === "1") {

                _this.goTo({
                  pcontroller: _this,
                  route: 'scheduling',
                  id: 'schedule',
                });

              } else if (result.AccountTicket === "0") {
                //load all blocks
                load_scheduleBlockList(_this, cb);
              }

            }

          });
        }

      },

      eventDrop: function(event /*, dayDelta, minuteDelta, allDay, revertFunc*/ ) {
        new UpdateEvent(_this, event.id, event.start, event.end, event.slot, join);
      },

      eventResize: function(event /*, dayDelta, minuteDelta, revertFunc*/ ) {
        new UpdateEvent(_this, event.id, event.start, event.end, event.slot, join);
      },

      dayClick: function( /*date , allDay, jsEvent, view*/ ) {

      },

      select: function(start, end /*, jsEvent, view*/ ) {

        var startTime = $.fullCalendar.formatDate(start, 'MM/dd/yyyy HH:mm'),
          endTime = $.fullCalendar.formatDate(end, 'MM/dd/yyyy HH:mm');

        //refresh number of slot everytime we tend to create a block
        _this.ScheduleAvailableSlot(null);

        //time slots are 1 hour
        if (extendToHour(_this, startTime, endTime, join.add())) {
          _this.layersVm.show(new ScheduleBlockViewModel({
            date: $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
            stime: $.fullCalendar.formatDate(start, 'MM/dd/yyyy HH:mm'),
            //etime: $.fullCalendar.formatDate(end, 'MM/dd/yyyy HH:mm'),          
            etime: _this.ScheduleEndTime(),
            slot: _this.ScheduleAvailableSlot(),
            blockTime: $.fullCalendar.formatDate(end, 'HH:mm'),
          }), function onClose(cb) {
            load_scheduleBlockList(_this, cb);
          });
        }
      },

      viewRender: function(view /*, element */ ) {
        _this.CalendarWeekStart = view.visStart;
        _this.CalendarWeekEnd = view.visEnd;
      },

      //add some more info on blocks
      eventRender: function(event, element) {

        var smallestDistance = getSmallestDistance(_this.ScheduleBlockList, _this.CalendarWeekStart, _this.CalendarWeekEnd);
        var borderColor = (event.distance === smallestDistance) ? '#00FF00' : '#ADD8E6';

        //assign different border color on smallest distance
        element.find('.fc-event-inner').attr('style', 'border: 1px solid ' + borderColor + ' !important');

        element.find('.fc-event-inner').attr("title", "Click here to schedule ticket in this block");
        element.find('.fc-event-title').append('<br/>' + event.someInfo);

        //enable editing of blocks          
        element.find('.fc-event-time').append('<button style="float: right !important; z-index: 999999 !important;" id="btnEdit' + event.id + '">Edit</button>');
        // element.find('.fc-event-time').append('<button style="float: right !important; z-index: 999999 !important;" id="btnView' + event.id + '">View Tickets</button>');
        $("#btnEdit" + event.id).click(function(e) {

          _this.layersVm.show(new EditScheduleBlockViewModel({
            blockInfo: event.blockInfo
          }), function onClose(cb) {
            load_scheduleBlockList(_this, cb);
          });

          e.stopPropagation();
        });

        //view block tickets
        // $("#btnView" + event.id).click(function(e) {

        //   if (event.blockInfo.NoOfTickets > 0) {

        //     _this.layersVm.show(new ScheduleBlockTicketsViewModel({
        //       BlockID: event.id,
        //     }), function onClose(cb) {
        //       load_scheduleBlockList(cb);
        //     });

        //   } else {
        //     notify.info("No ticket to view.", null, 3);
        //   }

        //   e.stopPropagation();
        // });

        // determine which block ticket is clicked                    
        $("#ticketListGrid" + event.id).on("click", " tr", function(ev) {

          ev.stopImmediatePropagation();

          var isExecuted = false;

          //check to see if tr clicked is inside the ticketlistGrid              
          if ($(this).closest('table').attr('id') === ('ticketListGrid' + event.id)) {

            //to be sure pop-up only called once
            if (!isExecuted) {

              //show ticket info screen if not undefined
              if ($(this).attr('id')) {

                _this.layersVm.show(new UnScheduleTicketViewModel({
                  ScheduleTicketId: $(this).attr('id'),
                }), function onClose(result, cb) {

                  //reload only if result is true
                  if (result) {
                    load_scheduleBlockList(_this, cb);
                  }

                });

                isExecuted = true;
              }

            }

          }


        });


        //e.stopImmediatePropagation();

        //});

      },

    });

  };


  function UpdateEvent(_this, EventID, EventStart, EventEnd, slot, join) {

    var block,
      scheduleBlock = {},
      startTime = $.fullCalendar.formatDate(EventStart, 'MM/dd/yyyy HH:mm'),
      endTime = $.fullCalendar.formatDate(EventEnd, 'MM/dd/yyyy HH:mm');

    //time slots are 1 hour
    if (extendToHour(_this, startTime, endTime, join.add())) {

      block = (parseInt($.fullCalendar.formatDate(EventEnd, 'HH:mm'), 10) < 12) ? 'AM' : 'PM';

      scheduleBlock = {
        'BlockID': EventID,
        'Block': block,
        'StartTime': $.fullCalendar.formatDate(EventStart, 'MM/dd/yyyy HH:mm'),
        'EndTime': _this.ScheduleEndTime(),
        'AvailableSlots': slot,
        'IsTechConfirmed': true
      };

      dataservice.scheduleenginesrv.SeScheduleBlock.save({
        id: EventID,
        data: scheduleBlock,
        link: 'SE',
      }, null, utils.safeCallback(null, function(err, resp) {

          if (resp && resp.Value) {
            //$('#techCalendar').fullCalendar('addEventSource', result);
            load_scheduleBlockList(_this);
          }
        },
        notify.error, false));

    }

  }


  function load_scheduleBlockList(_this, cb) {

    var current = new Date(), // get current date    
      weekstart = current.getDate() - current.getDay() + 1,
      weekend = weekstart + 5, // end day 5 for saturday 
      start = new Date(current.setDate(weekstart)),
      end = new Date(current.setDate(weekend)),
      param,
      x,
      y,
      tColor,
      slotAvailable,
      numTickets,
      data = {},
      result = [],
      distance = 0,
      distanceText,
      curTicket;

    param = {
      'DateFrom': $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
      'DateTo': $.fullCalendar.formatDate(end, 'MM/dd/yyyy')
    };

    //console.log("Date range:" + JSON.stringify(param));

    dataservice.scheduleenginesrv.SeScheduleBlockList.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("SeScheduleBlockList:" + JSON.stringify(resp.Value));

        _this.ScheduleBlockList = resp.Value;

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


          if (resp.Value[x].NoOfTickets > 0) {
            distance = resp.Value[x].Distance.toFixed(2);
          } else {
            distance = 0;
          }

          distanceText = (distance <= 0) ? "" : "<br />Distance: " + distance + " mile(s)";


          //objects to display on scheduler grid
          data = {
            id: resp.Value[x].BlockID,
            title: null,
            start: resp.Value[x].StartTime,
            end: resp.Value[x].EndTime,
            slot: slotAvailable,
            nTickets: numTickets,
            zipCode: resp.Value[x].ZipCode,
            blockInfo: resp.Value[x],
            distance: distance,
            allDay: false,
            //someInfo: '' + resp.Value[x].Block + ' Block <br/> Zip: ' + ((resp.Value[x].ZipCode) ? resp.Value[x].ZipCode : '') + ' <br /> Max Radius: ' + ((resp.Value[x].MaxRadius) ? resp.Value[x].MaxRadius + ' mile(s)' : '') + distanceText + '  <br /> Available: ' + (slotAvailable - numTickets) + ' of ' + ((resp.Value[x].AvailableSlots) ? resp.Value[x].AvailableSlots : 0) + ' <br /><hr> ' + resp.Value[x].TechnicianName + ' <br />',
            //someInfo: 'Zip: ' + ((resp.Value[x].ZipCode) ? resp.Value[x].ZipCode : '') + ' <br /> Max Radius: ' + ((resp.Value[x].MaxRadius) ? resp.Value[x].MaxRadius + ' mile(s)' : '') + distanceText + '  <br /> Available: ' + (slotAvailable - numTickets) + ' of ' + ((resp.Value[x].AvailableSlots) ? resp.Value[x].AvailableSlots : 0) + ' <br /><hr> ' + resp.Value[x].TechnicianName + ' <br />',
            someInfo: 'Zip: ' + ((resp.Value[x].ZipCode) ? resp.Value[x].ZipCode : '') +
              ' <br /> Max Radius: ' + ((resp.Value[x].MaxRadius) ? resp.Value[x].MaxRadius + ' mile(s)' : '') +
              distanceText +
              '  <br /> Available: ' + (slotAvailable - numTickets) + ' of ' + ((resp.Value[x].AvailableSlots) ? resp.Value[x].AvailableSlots : 0) +
              ' <br /><hr> ' + resp.Value[x].TechnicianName +
              ' <br /><hr> ' +
              '<table id="ticketListGrid' + resp.Value[x].BlockID + '" style="border: 1px solid !important; position: relative; width: 100%; z-index: 999999 !important;">' +
              '<th>Name</th><th>Ticket Number</th><th>Ticket Type</th><th>Zip Code</th>' +
              '</table>',
            backgroundColor: tColor,
          };

          //list of blocks from server
          result.push(data);

        } //end for loop        

        //console.log("Final Source:" + JSON.stringify(result));

        $('#calendar').fullCalendar('removeEvents');

        $('#calendar').fullCalendar('addEventSource', result);

        //another loop to append ticket list on blocks
        for (x = 0; x < resp.Value.length; x++) {

          console.log("Tickets to append:" + JSON.stringify(resp.Value[x].TicketList));
          curTicket = resp.Value[x].TicketList;

          //hide grid if no tickets available to show
          if (curTicket.length <= 0) {
            $("#ticketListGrid" + resp.Value[x].BlockID).hide();
          }

          for (y = 0; y < curTicket.length; y++) {
            $("#ticketListGrid" + resp.Value[x].BlockID).append('<tr id=' + curTicket[y].ScheduleTicketId + '><td>' + curTicket[y].CustomerFullName + '</td><td>' + curTicket[y].TicketID + '</td><td>' + curTicket[y].TicketTypeName + '</td><td>' + curTicket[y].ZipCode + '</td></tr>');
          }

        }


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
    if (!_this.ScheduleAvailableSlot()) {
      _this.ScheduleAvailableSlot(hourDiff);
    }

    return true;

  }

  // //time slots are 1 hour
  // function extendToHour(_this, start, end) {

  //   var startDuration,
  //     endDuration,
  //     minuteDiff,
  //     minuteExtra,
  //     hourDiff;

  //   //these will do the following - to always achive 1 hour slot implementation

  //   // - get moments of start and end time    
  //   startDuration = moment(start);
  //   endDuration = moment(end);
  //   // - get the hour difference
  //   hourDiff = endDuration.diff(startDuration, 'hour');
  //   // - get the minute difference
  //   minuteDiff = endDuration.diff(startDuration, 'minutes');
  //   // - get the modulo by 60 of minute difference and if greater than 0, add 1/extend to 1 hour
  //   minuteExtra = minuteDiff % 60;

  //   if (minuteExtra) {
  //     hourDiff++;
  //   }

  //   //set the final endtime of block
  //   _this.ScheduleEndTime(moment(startDuration.add("hour", hourDiff)).format("MM/DD/YYYY HH:mm"));

  //   //set the number of slots for a block
  //   _this.ScheduleAvailableSlot(hourDiff);

  // }

  //determine the smallest in distance from the scheduleblock list excluding null and zero
  function getSmallestDistance(scheduleBlockList, dateFrom, dateTo) {
    // alert("getSmallestDistance");
    var smallestDistance = 10000000;
    for (var x = 0; x < scheduleBlockList.length; x++) {
      var endDateTime = new Date(scheduleBlockList[x].EndTime);
      if (endDateTime >= dateFrom && endDateTime <= dateTo) {
        var distance = scheduleBlockList[x].Distance.toFixed(2);
        if (distance < smallestDistance && distance !== 0 && scheduleBlockList[x].NoOfTickets > 0 && scheduleBlockList[x].CurrentTicketId !== null) {
          smallestDistance = distance;
          console.log('current smallest' + endDateTime);
        }
      }
    }
    console.log('****************************smallestDistance: ' + smallestDistance);
    return smallestDistance;
  }

  return ScheduleViewModel;
});
