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
  //'src/ukov',

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
  joiner
  //ukov
) {
  'use strict';

  var schema;

  schema = {
    _model: true
  };


  function TechnicianViewModel(options) {
    var _this = this;

    TechnicianViewModel.super_.call(_this, options);

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

  utils.inherits(TechnicianViewModel, ControllerViewModel);
  TechnicianViewModel.prototype.viewTmpl = 'tmpl-technician-availability';

  //
  // members
  //

  TechnicianViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // override me    
    //var join = joiner();
  };

  TechnicianViewModel.prototype.onActivate = function( /*routeData*/ ) { // override me  

    var _this = this,
      isTech = true, //temp
      isBlockOwned = true, //temp
      join = joiner();

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
      editable: true,
      allDaySlot: false,
      selectable: true,
      slotMinutes: 15,
      selectHelper: true,
      aspectRatio: 2.1,
      hiddenDays: [0], //hide sunday      
      eventClick: function( /*Event, jsEvent, view*/ ) {
        //alert(Event.technicianid);
        if (isBlockOwned) {
          //alert("@TODO do stuff");
        } else {
          notify.warn("That availability block does not belong to you.", null, 3);
          return;
        }
      },

      eventDrop: function(event /*, dayDelta, minuteDelta, allDay, revertFunc*/ ) {

        if (isBlockOwned) {
          new UpdateEvent(event.id, event.start, event.end);
        } else {
          notify.warn("That availability block does not belong to you.", null, 3);
          return;
        }

      },

      eventResize: function(event /*, dayDelta, minuteDelta, revertFunc*/ ) {

        if (isBlockOwned) {
          new UpdateEvent(event.id, event.start, event.end);
        } else {
          notify.warn("That availability block does not belong to you.", null, 3);
          return;
        }

      },

      dayClick: function( /*date , allDay, jsEvent, view*/ ) {

      },

      select: function(start, end /*, jsEvent, view*/ ) {

        //isTech = false; //for testing

        if (isTech) {
          _this.layersVm.show(new TechSignUpViewModel({
            date: $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
            stime: $.fullCalendar.formatDate(start, 'MM/dd/yyyy HH:mm'),
            etime: $.fullCalendar.formatDate(end, 'MM/dd/yyyy HH:mm'),
            blockTime: $.fullCalendar.formatDate(end, 'HH:mm'),
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
        element.find('.fc-event-title').append('<br/>' + event.someInfo);
      }

    });

  };


  function UpdateEvent(EventID, EventStart, EventEnd) {

    var block,
      param = {};

    block = (parseInt($.fullCalendar.formatDate(EventEnd, 'HH:mm'), 10) < 12) ? 'AM' : 'PM';

    param = {
      'BlockID': EventID,
      'Block': block,
      'StartTime': $.fullCalendar.formatDate(EventStart, 'MM/dd/yyyy HH:mm'),
      'EndTime': $.fullCalendar.formatDate(EventEnd, 'MM/dd/yyyy HH:mm'),
    };

    dataservice.scheduleenginesrv.SeScheduleBlock.post(EventID, param, null, utils.safeCallback(null, function(err, resp) {

      console.log(resp);

      if (resp && resp.Value) {
        load_technicianAvailabilityList();
      }

    }, function(err) {
      notify.error(err);
    }));


  }

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
          IsOwned = true; //for testing

          //if technicianid equals current user, block is owned
          if (resp.Value[x].TenicianId === app.user.peek().GPEmployeeID) {
            IsOwned = true;
          }

          tColor = (IsOwned) ? 'lightblue' : 'white';
          tName = resp.Value[x].TechnicianName;

          //objects to display on technician availability grid
          data = {
            id: resp.Value[x].BlockID,
            title: null,
            start: resp.Value[x].StartTime,
            end: resp.Value[x].EndTime,
            allDay: false,
            technicianid: 12345,
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

  return TechnicianViewModel;
});
