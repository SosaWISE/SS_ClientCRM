define('src/scheduling/technician.availability.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/app',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/scheduling/technician.signup.vm',
  'src/core/layers.vm',
  'src/core/joiner',
  'moment',
  'ko',
], function(
  $,
  fullCalendar,
  dataservice,
  app,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel,
  TechSignUpViewModel,
  LayersViewModel,
  joiner,
  moment,
  ko
) {
  'use strict';

  var schema;

  schema = {
    _model: true,
    RuTechnician: {}
  };


  function TechnicianViewModel(options) {
    var _this = this;

    TechnicianViewModel.super_.call(_this, options);


    //This a layer for creating new ticket (Pop-up)
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.AvailableEndTime = ko.observable();
    _this.ScheduleAvailableSlot = ko.observable();

    //events
    //
  }

  utils.inherits(TechnicianViewModel, ControllerViewModel);
  TechnicianViewModel.prototype.viewTmpl = 'tmpl-technician-availability';

  //
  // members
  //

  TechnicianViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // override me    
    var join = joiner(),
      _this = this;
    load_technician(_this, join.add());
  };

  TechnicianViewModel.prototype.onActivate = function( /*routeData*/ ) { // override me  

    var _this = this,
      isTech = false, //temp
      isBlockOwned = false, //temp
      join = joiner();

    //load_technician(join.add());

    //load technician availability list    
    load_technicianAvailabilityList(join.add());

    /** Fullcalendar plugin **/
    $('#techCalendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      defaultView: 'agendaWeek',
      lazyFetching: false,
      editable: true,
      allDaySlot: false,
      selectable: true,
      slotMinutes: 15,
      selectHelper: true,
      aspectRatio: 2.1,
      hiddenDays: [0], //hide sunday 
      minTime: 8, //start at 8am     
      eventClick: function(event /*, jsEvent, view*/ ) {
        console.log(_this.RuTechnician);
        isBlockOwned = false;
        if (_this.RuTechnician != null) {
          isBlockOwned = (_this.RuTechnician.TechnicianId === event.technicianId) ? true : false;
        }

        if (isBlockOwned) {
          alert("@TODO do stuff on eventClick");
        } else {
          notify.warn("That availability block does not belong to you.", null, 3);
          return;
        }
      },

      eventDrop: function(event /*, dayDelta, minuteDelta, allDay, revertFunc*/ ) {
        console.log(_this.RuTechnician);
        isBlockOwned = false;
        if (_this.RuTechnician != null) {
          isBlockOwned = (_this.RuTechnician.TechnicianId === event.technicianId) ? true : false;
        }

        if (isBlockOwned) {
          //new UpdateEvent(event.id, event.start, event.end);
          new UpdateEvent(_this, event, join);

        } else {
          notify.warn("That availability block does not belong to you.", null, 3);
          return;
        }

      },

      eventResize: function(event /*, dayDelta, minuteDelta, revertFunc*/ ) {
        console.log(_this.RuTechnician);
        isBlockOwned = false;
        if (_this.RuTechnician != null) {
          isBlockOwned = (_this.RuTechnician.TechnicianId === event.technicianId) ? true : false;
        }

        if (isBlockOwned) {
          // new UpdateEvent(event.id, event.start, event.end);
          new UpdateEvent(_this, event, join);
        } else {
          notify.warn("That availability block does not belong to you.", null, 3);
          return;
        }

      },

      dayClick: function( /*date , allDay, jsEvent, view*/ ) {

      },

      //select: function(start, end /*, jsEvent, view*/ ) {
      select: function(start, end /*, jsEvent, view*/ ) {

        //isTech = (_this.RuTechnician != null) ? true : false; //for real
        isTech = true; // for now - Allow non technicians to schedule availability

        var startTime = $.fullCalendar.formatDate(start, 'MM/dd/yyyy HH:mm'),
          endTime = $.fullCalendar.formatDate(end, 'MM/dd/yyyy HH:mm');

        //clear available slot everytime we create a tech availability
        _this.ScheduleAvailableSlot(null);

        //time slots are 1 hour
        extendToHour(_this, startTime, endTime, join.add());

        if (isTech) {
          _this.layersVm.show(new TechSignUpViewModel({
            date: $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
            stime: $.fullCalendar.formatDate(start, 'MM/dd/yyyy HH:mm'),
            etime: _this.AvailableEndTime(),
            slot: _this.ScheduleAvailableSlot(),
            blockTime: $.fullCalendar.formatDate(end, 'HH:mm'),
            RuTechnician: _this.RuTechnician,
          }), function onClose(result, cb) {
            if (!result) {
              load_technicianAvailabilityList(cb);
            }

          });
        } else {
          notify.warn("You are a not a technician and you cannot add availability", null, 3);
          return;
        }

      },

      viewRender: function( /*view, element*/ ) {},

      //add some more info on blocks
      eventRender: function(event, element) {

        element.find('.fc-event-inner').attr('style', 'border: 1px solid #ADD8E6 !important');

        element.find('.fc-event-title').append('<br/>' + event.someInfo);

        //enable delete of technician availability
        element.find('.fc-event-time').append('<button style="float: right !important; z-index: 999999 !important;" id="btnDelete' + event.id + '">Delete</button>');
        $("#btnDelete" + event.id).click(function(e) {

          notify.confirm('Delete?', 'Are you sure you want to delete?', function(result) {
            if (result !== 'yes') {
              return;
            }

            dataservice.scheduleenginesrv.SeScheduleBlock.del(event.id, null, utils.safeCallback(null, function(err, resp) {

              if (resp.Code === 0) {
                notify.info("Success deleting availability with id:" + event.id + ".");
                load_technicianAvailabilityList();
              }

            }, function(err) {
              notify.error(err);
            }));

          });

          e.stopPropagation();

        });

      },

      // events: function(start, end, timezone, callback) {
      //   //alert(start+end);
      //   load_technicianAvailabilityList(callback);  
      //   //callback(events);
      // }

    });

  };

  function UpdateEvent(_this, event, join) {

    var block,
      scheduleBlock = {},
      startTime = $.fullCalendar.formatDate(event.start, 'MM/dd/yyyy HH:mm'),
      endTime = $.fullCalendar.formatDate(event.end, 'MM/dd/yyyy HH:mm');

    //time slots are 1 hour
    extendToHour(_this, startTime, endTime, join.add());

    block = (parseInt($.fullCalendar.formatDate(event.end, 'HH:mm'), 10) < 12) ? 'AM' : 'PM';

    scheduleBlock = {
      'BlockID': event.id,
      'Block': block,
      'StartTime': $.fullCalendar.formatDate(event.start, 'MM/dd/yyyy HH:mm'),
      //'EndTime': $.fullCalendar.formatDate(event.end, 'MM/dd/yyyy HH:mm'),
      'EndTime': _this.AvailableEndTime(),
      'AvailableSlots': event.slot,
      'IsTechConfirmed': true
    };

    dataservice.scheduleenginesrv.SeScheduleBlock.save({
      id: scheduleBlock.BlockID,
      data: scheduleBlock,
      link: 'SE',
    }, null, utils.safeCallback(null, function(err, resp) {

        if (resp && resp.Value) {
          // var oSchedubleBlock = resp.Value;

          // var modifiedEvent = {
          //   id: oSchedubleBlock.BlockID,
          //   title: null,
          //   start: oSchedubleBlock.StartTime,
          //   end: oSchedubleBlock.EndTime,
          //   allDay: false,
          //   technicianId: oSchedubleBlock.TechnicianId,
          //   backgroundColor: oSchedubleBlock.Color,
          //   someInfo: 'Technician Name:' + oSchedubleBlock.TechnicianName,
          // };

          //to avoid reload
          //$('#techCalendar').fullCalendar('updateEvent', modifiedEvent);          

          // changed back to reloading all events: the size of the block won't update unless reloading them all
          load_technicianAvailabilityList();

        }
      },
      notify.error, false));
  }

  // function UpdateEvent(EventID, EventStart, EventEnd) {

  //   var block,
  //     scheduleBlock = {};

  //   block = (parseInt($.fullCalendar.formatDate(EventEnd, 'HH:mm'), 10) < 12) ? 'AM' : 'PM';

  //   scheduleBlock = {
  //     'BlockID': EventID,
  //     'Block': block,
  //     'StartTime': $.fullCalendar.formatDate(EventStart, 'MM/dd/yyyy HH:mm'),
  //     'EndTime': $.fullCalendar.formatDate(EventEnd, 'MM/dd/yyyy HH:mm'),
  //     'IsTechConfirmed': true
  //   };

  //   dataservice.scheduleenginesrv.SeScheduleBlock.save({
  //       id: EventID, 
  //       data: scheduleBlock, 
  //       link:'SE',
  //     }, null, utils.safeCallback(null, function(err, resp) {

  //       if (resp && resp.Value) {

  //         //$('#techCalendar').fullCalendar('removeEvents');
  //         //$('#techCalendar').fullCalendar('addEventSource', result);
  //         load_technicianAvailabilityList();
  //       }
  //     }, 
  //     notify.error, false)
  //   );



  // }

  function load_technicianAvailabilityList(cb) {

    //@TODO retrieve and display the list of technician availability

    var current = new Date(), // get current date    
      weekstart = current.getDate() - current.getDay() + 1,
      weekend = weekstart + 5, // end day 5 for saturday 
      start = new Date(current.setDate(weekstart)),
      end = new Date(current.setDate(weekend)),
      param,
      data = {},
      result = [],
      tColor,
      IsOwned,
      tName,
      x;


    param = {
      'DateFrom': $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
      'DateTo': $.fullCalendar.formatDate(end, 'MM/dd/yyyy')
    };

    //dataservice.scheduleenginesrv.SeTechnicianAvailabilityList.read({}, null, utils.safeCallback(cb, function(err, resp) {
    dataservice.scheduleenginesrv.SeScheduleBlockList.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("SeScheduleBlockList:" + JSON.stringify(resp.Value));


        for (x = 0; x < resp.Value.length; x++) {

          //Own blocks - lightblue, otherwise white
          IsOwned = false; //for testing

          //if technicianid equals current user, block is owned
          if (resp.Value[x].TechnicianId === app.user.peek().GPEmployeeID) {
            IsOwned = true;
          }

          tColor = (IsOwned) ? 'lightblue' : 'white';
          tName = resp.Value[x].TechnicianName;
          console.log(tName);
          //objects to display on technician availability grid
          data = {
            id: resp.Value[x].BlockID,
            title: null,
            start: resp.Value[x].StartTime,
            end: resp.Value[x].EndTime,
            slot: resp.Value[x].AvailableSlots,
            allDay: false,
            technicianId: resp.Value[x].TechnicianId,
            backgroundColor: tColor,
            someInfo: 'Technician Name:' + tName,
          };

          //list of blocks from server
          result.push(data);

        }

        $('#techCalendar').fullCalendar('removeEvents');

        $('#techCalendar').fullCalendar('addEventSource', result);


      } else {
        notify.error(err);
      }
    }));

  }

  function load_technician(_this, cb) {
    console.log('load_technician called');
    dataservice.humanresourcesrv.RuTechnician.read({
      id: app.user.peek().GPEmployeeID,
      link: 'TID'
    }, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        _this.RuTechnician = resp.Value;
        console.log(resp.Value);
      } else {
        _this.RuTechnician(null);
      }
    }));

  }

  //time slots are 1 hour
  function extendToHour(_this, start, end) {

    var startDuration,
      endDuration,
      minuteDiff,
      minuteExtra,
      hourDiff;

    //these will do the following - to always achive 1 hour slot implementation

    // - get moments of start and end time
    startDuration = moment(start);
    endDuration = moment(end);
    // - get the hour difference
    hourDiff = endDuration.diff(startDuration, 'hour');
    // - get the minute difference
    minuteDiff = endDuration.diff(startDuration, 'minutes');
    // - get the modulo by 60 of minute difference and if greater than 0, add 1/extend to 1 hour
    minuteExtra = minuteDiff % 60;

    if (minuteExtra) {
      hourDiff++;
    }

    //set the final endtime of block
    _this.AvailableEndTime(moment(startDuration.add("hour", hourDiff)).format("MM/DD/YYYY HH:mm"));

    //set the number of slots for a block, if slot not empty - use what is in the box
    if (!_this.ScheduleAvailableSlot()) {
      _this.ScheduleAvailableSlot(hourDiff);
    }

  }


  return TechnicianViewModel;
});
