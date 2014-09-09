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
  EditScheduleBlockViewModel,
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

    //alert(JSON.stringify(_this.data.getValue()));
    console.log(_this.data.getValue());

    //populate account info if data is available
    if (_this.data.getValue().Ticket) {

      if (_this.data.getValue().Ticket.AccountId) {
        $('#accountNumber').html(_this.data.getValue().Ticket.AccountId + ' ');
      }
      if (_this.data.getValue().Ticket.CustomerFullName) {
        $('#accountName').html(_this.data.getValue().Ticket.CustomerFullName + ' ');
      }
      if (_this.data.getValue().Ticket.CompleteAddress) {
        $('#accountAddress').html(_this.data.getValue().Ticket.CompleteAddress + ' ');
      }

    } else {
      $('#accountInfo').hide();
    }

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

        //if zipcode is null, let the user input zip, no. of slots, etc
        // if(calEvent.zipCode === null){

        //   _this.layersVm.show(new ScheduleBlockViewModel({
        //     BlockID: calEvent.id,
        //     date: $.fullCalendar.formatDate(calEvent.start, 'MM/dd/yyyy'),
        //     stime: $.fullCalendar.formatDate(calEvent.start, 'MM/dd/yyyy HH:mm'),
        //     etime: $.fullCalendar.formatDate(calEvent.end, 'MM/dd/yyyy HH:mm'),
        //     blockTime: $.fullCalendar.formatDate(calEvent.end, 'HH:mm'),
        //   }), function onClose(cb) {
        //     load_scheduleBlockList(cb);
        //   });

        // }else{

        //console.log(parseInt(calEvent.nTickets, 10) < parseInt(calEvent.slot, 10));
        //show create ticket screen only when there are still spaces available for a specific block
        if (parseInt(calEvent.nTickets, 10) < parseInt(calEvent.slot, 10)) {

          var model = _this.data.getValue();
          //console.log('model'+model); 
          //alert(JSON.stringify(model));
          //alert(JSON.stringify(model.Ticket));

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
                load_scheduleBlockList(cb);
              }

            }

          });
        }
        //}

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

        //enable editing of blocks          
        element.find('.fc-event-time').append('<button style="float: right !important; z-index: 999999 !important;" id="btnEdit' + event.id + '">Edit</button>');
        $("#btnEdit" + event.id).click(function(e) {

          _this.layersVm.show(new EditScheduleBlockViewModel({
            blockInfo: event.blockInfo,
          }), function onClose(cb) {
            load_scheduleBlockList(cb);
          });

          e.stopPropagation();
        });
      },

    });

  };


  function UpdateEvent(EventID, EventStart, EventEnd) {

    var block,
      scheduleBlock = {};

    block = (parseInt($.fullCalendar.formatDate(EventEnd, 'HH:mm'), 10) < 12) ? 'AM' : 'PM';

    scheduleBlock = {
      'BlockID': EventID,
      'Block': block,
      'StartTime': $.fullCalendar.formatDate(EventStart, 'MM/dd/yyyy HH:mm'),
      'EndTime': $.fullCalendar.formatDate(EventEnd, 'MM/dd/yyyy HH:mm'),
      'IsTechConfirmed': true
    };

    dataservice.scheduleenginesrv.SeScheduleBlock.save({
      id: EventID,
      data: scheduleBlock,
      link: 'SE',
    }, null, utils.safeCallback(null, function(err, resp) {

        if (resp && resp.Value) {
          //$('#techCalendar').fullCalendar('addEventSource', result);
          load_scheduleBlockList();
        }
      },
      notify.error, false));

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
      result = [],
      distance = 0,
      distanceText;

    param = {
      'DateFrom': $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
      'DateTo': $.fullCalendar.formatDate(end, 'MM/dd/yyyy')
    };

    //console.log("Date range:" + JSON.stringify(param));

    dataservice.scheduleenginesrv.SeScheduleBlockList.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("SeScheduleBlockList:" + JSON.stringify(resp.Value));

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

          //calculate distance - this is temporary, we might use the distance computation from api
          // if (resp.Value[x].CurrentTicketId) {

          //   distance = calculateDistance(
          //     resp.Value[x].BlockLatitude,
          //     resp.Value[x].BlockLongitude,
          //     resp.Value[x].TicketLatitude,
          //     resp.Value[x].TicketLongitude
          //   ).toFixed(0);

          //   //if customer does not have coordinates, set distance = 0
          //   if (resp.Value[x].TicketLatitude === null && resp.Value[x].TicketLongitude) {
          //     distance = 0;
          //   }

          // }

          if (resp.Value[x].NoOfTickets > 0) {
            distance = resp.Value[x].Distance.toFixed(2);
          } else {
            distance = 0;
          }

          distanceText = (distance <= 0) ? "" : "<br />Distance: " + distance + " mile(s)";
          //distanceText = (resp.Value[x].Distance === null) ? "" : "<br />Distance: "+resp.Value[x].Distance+ " mile(s)";
          //distance = 0; //reset
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
            allDay: false,
            //someInfo: '' + resp.Value[x].Block + ' Block <br/> Zip: ' + ((resp.Value[x].ZipCode) ? resp.Value[x].ZipCode : '') + ' <br /> Max Radius: ' + ((resp.Value[x].MaxRadius) ? resp.Value[x].MaxRadius + ' mile(s)' : '') + distanceText + '  <br /> Available: ' + (slotAvailable - numTickets) + ' of ' + ((resp.Value[x].AvailableSlots) ? resp.Value[x].AvailableSlots : 0) + ' <br /><hr> ' + resp.Value[x].TechnicianName + ' <br />',
            someInfo: 'Zip: ' + ((resp.Value[x].ZipCode) ? resp.Value[x].ZipCode : '') + ' <br /> Max Radius: ' + ((resp.Value[x].MaxRadius) ? resp.Value[x].MaxRadius + ' mile(s)' : '') + distanceText + '  <br /> Available: ' + (slotAvailable - numTickets) + ' of ' + ((resp.Value[x].AvailableSlots) ? resp.Value[x].AvailableSlots : 0) + ' <br /><hr> ' + resp.Value[x].TechnicianName + ' <br />',
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

  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  // function calculateDistance(lat1, lon1, lat2, lon2) {

  //   //var R = 6371, // km
  //   var R = 3958.755866, // mile
  //     dLat = toRad(lat2 - lat1),
  //     dLon = toRad(lon2 - lon1),
  //     dlat1 = toRad(lat1),
  //     dlat2 = toRad(lat2);

  //   var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(dlat1) * Math.cos(dlat2);
  //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   var d = R * c;
  //   return d;
  // }

  // // Converts numeric degrees to radians
  // function toRad(Value) {
  //   return Value * Math.PI / 180;
  // }


  return ScheduleViewModel;
});
