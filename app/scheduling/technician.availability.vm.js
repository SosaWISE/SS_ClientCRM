define('src/scheduling/technician.availability.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'src/scheduling/technician.signup.vm',
  'src/core/layers.vm',
  //'src/core/joiner',
  //'ko',
  'src/ukov',

], function(
  $,
  fullCalendar,
  dataservice,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel,
  TechSignUpViewModel,
  LayersViewModel,
  //joiner,
  //ko,
  ukov
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

    var _this = this;
    //join = joiner();

    _this.data = ukov.wrap({
      //Ticket: routeData.extraData.ticket,
    }, schema);


    //load block list    
    //load_scheduleBlockList(join.add());

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
      eventClick: function( /*calEvent , jsEvent, view*/ ) {
        //show create ticket screen only when there are still spaces available for a specific block
        // if (parseInt(calEvent.nTickets, 10) < parseInt(calEvent.slot, 10)) {
        //   _this.layersVm.show(new ScheduleTicketViewModel({
        //     date: $.fullCalendar.formatDate(calEvent.start, 'MM/dd/yyyy'),
        //     blockId: calEvent.id,
        //   }), function onClose(cb) {
        //     load_scheduleBlockList(cb);
        //   });
        // }

      },

      eventDrop: function( /*event, dayDelta, minuteDelta, allDay, revertFunc*/ ) {
        //new UpdateEvent(event.id, event.start, event.end);
      },

      eventResize: function( /*event, dayDelta, minuteDelta, revertFunc*/ ) {
        //new UpdateEvent(event.id, event.start, event.end);
      },

      dayClick: function( /*date , allDay, jsEvent, view*/ ) {

      },

      select: function(start, end /*, jsEvent, view*/ ) {

        _this.layersVm.show(new TechSignUpViewModel({
          date: $.fullCalendar.formatDate(start, 'MM/dd/yyyy'),
          stime: $.fullCalendar.formatDate(start, 'MM/dd/yyyy HH:mm'),
          etime: $.fullCalendar.formatDate(end, 'MM/dd/yyyy HH:mm'),
          blockTime: $.fullCalendar.formatDate(end, 'HH:mm'),
        }), function onClose( /*cb*/ ) {
          //load_technicianAvailabilityList(cb);
        });
      },

      viewRender: function( /*view, element*/ ) {},

      //add some more info on blocks
      eventRender: function( /*event, element*/ ) {
        //element.find('.fc-event-title').append('<br/>' + event.someInfo);
      }

    });

  };

  // function load_technicianAvailabilityList(cb) {

  //   //@TODO retrieve and display the list of technician availability

  //   dataservice.scheduleenginesrv.SeTechnicianAvailabilityList.read(null, null, null, utils.safeCallback(cb, function(err, resp) {

  //     if (resp.Code === 0) {
  //       console.log("SeTechnicianAvailabilityList:" + JSON.stringify(resp.Value));
  //     } else {
  //       notify.error(err);
  //     }
  //   }));

  // }

  return TechnicianViewModel;
});
