define('src/scheduling/scheduleblock.viewticket.vm', [
  'src/app',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/scheduling/scheduleblock.viewticket.gvm',
  'src/core/joiner',
  //'ko',
  //'src/ukov',
], function(
  app,
  dataservice,
  notify,
  utils,
  BaseViewModel,
  ScheduleBlockViewTicketGridViewModel,
  joiner
  //ko,
  //ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
  };


  function ScheduleBlockTicketsViewModel(options) {
    var _this = this,
      join = joiner();

    ScheduleBlockTicketsViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Schedule Block View Tickets';

    // _this.data = ukov.wrap(_this.item || {
    // }, schema);

    _this.scheduleBlockViewTicketGvm = new ScheduleBlockViewTicketGridViewModel({

      unscheduleblockTicket: function(ticket, cb) {

        dataservice.scheduleenginesrv.SeScheduleTicket.del(ticket.ScheduleTicketId, null, utils.safeCallback(cb, function(err, resp) {

          if (resp.Code === 0) {
            notify.info("Success");
            load_blockTickets(_this);
          }

        }, function(err) {
          notify.error(err);
        }));

      },

    });

    //load block tickets
    load_blockTickets(_this, join.add());

    //
    // events
    //

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(ScheduleBlockTicketsViewModel, BaseViewModel);
  ScheduleBlockTicketsViewModel.prototype.viewTmpl = 'tmpl-schedule-block-view-ticket';
  ScheduleBlockTicketsViewModel.prototype.width = "70%";
  ScheduleBlockTicketsViewModel.prototype.height = 400;

  ScheduleBlockTicketsViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;

    //Initialize empty grid
    _this.scheduleBlockViewTicketGvm.list([]);


  };


  ScheduleBlockTicketsViewModel.prototype.onActivate = function() {

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }

  ScheduleBlockTicketsViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_blockTickets(_this, cb) {

    var param = {
      id: _this.BlockID,
      link: 'BID'
    };

    dataservice.scheduleenginesrv.SeTicketList.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        //populate grid
        _this.scheduleBlockViewTicketGvm.list(resp.Value);
      }

    }, notify.iferror));

  }

  return ScheduleBlockTicketsViewModel;
});
