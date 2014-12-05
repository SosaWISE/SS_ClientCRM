define('src/scheduling/scheduleblock.unscheduleticket.vm', [
  'src/app',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/joiner',
  'ko',
  'src/ukov',
], function(
  app,
  dataservice,
  notify,
  utils,
  BaseViewModel,
  joiner,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    TicketAccountName: {},
    TicketNumber: {},
    TicketType: {},
    TicketZipcode: {},
    TicketNotes: {},
  };


  function UnScheduleTicketViewModel(options) {
    var _this = this,
      join = joiner();

    UnScheduleTicketViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'UnSchedule Ticket';

    load_ticketInfo(_this, join.add());

    _this.data = ukov.wrap(_this.item || {
      TicketAccountName: null,
      TicketNumber: null,
      TicketType: null,
      TicketZipcode: null,
      TicketNotes: null,
    }, schema);

    //
    // events
    //

    _this.cmdUnscheduleTicket = ko.command(function(cb) {

      dataservice.scheduleenginesrv.SeScheduleTicket.del(_this.ScheduleTicketId, null, utils.safeCallback(cb, function(err, resp) {

        if (resp.Code === 0) {
          _this.layerResult = resp.Value;
          closeLayer(_this);
        }

      }, function(err) {
        notify.error(err);
      }));

    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(UnScheduleTicketViewModel, BaseViewModel);
  UnScheduleTicketViewModel.prototype.viewTmpl = 'tmpl-unschedule-ticket';
  UnScheduleTicketViewModel.prototype.width = 400;
  UnScheduleTicketViewModel.prototype.height = 'auto';

  UnScheduleTicketViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // override me
  };

  UnScheduleTicketViewModel.prototype.onActivate = function() {

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }

  UnScheduleTicketViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_ticketInfo(_this, cb) {

    var param = {
      id: _this.ScheduleTicketId,
      link: 'STID'
    };

    dataservice.scheduleenginesrv.SeTicket.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        //populate fields
        _this.data.TicketAccountName(resp.Value.CustomerFullName);
        _this.data.TicketNumber(resp.Value.TicketID);
        _this.data.TicketType(resp.Value.TicketTypeName);
        _this.data.TicketZipcode(resp.Value.ZipCode);
        _this.data.TicketNotes(resp.Value.Notes);

      }

    }, notify.iferror));

  }

  return UnScheduleTicketViewModel;
});
