define('src/scheduling/technician.ticket.info.vm', [
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/scheduling/technician.ticket.info.gvm',
  'src/scheduling/technician.ticket.complete.note.vm',
  'ko',
  'src/ukov',
], function(
  dataservice,
  notify,
  utils,
  BaseViewModel,
  TechnicianTicketInfoGridViewModel,
  TechTicketCompleteNoteViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;
  schema = {
    _model: true,
    custName: {},
    custAddress: {},
    custPhone: {},
    TechTicketNotes: {},
    ClosingNote: {},
    ConfirmationNo: {},
  };

  function TechTicketInfoViewModel(options) {
    var _this = this;
    TechTicketInfoViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    //Set title
    _this.title = _this.title || 'Technician Ticket Info';

    _this.data = ukov.wrap(_this.item || {
      custName: null,
      custAddress: null,
      custPhone: null,
      TechTicketNotes: null,
      ClosingNote: null,
      ConfirmationNo: null,
    }, schema);

    var obj = _this.rowObj;

    //populate fields name, address and phone
    _this.data.custName(obj.CustomerFullName);
    _this.data.custAddress(obj.Address);

    if (obj.PhoneHome !== null) {
      _this.data.custPhone(obj.PhoneHome);
    } else {
      _this.data.custPhone(obj.PhoneMobile);
    }

    //ticket id
    _this.TicketId = obj.TicketID;

    //account id
    _this.AccountId = obj.AccountId;

    //general note
    _this.data.TechTicketNotes(obj.Notes);

    _this.technicianTicketInfoGvm = new TechnicianTicketInfoGridViewModel({});

    //
    // events
    //

    _this.cmdEnRoute = ko.command(function(cb) {
      //@TODO
      // this method will set IsTechEnRoute(ITER) status to true
      // and send email to customer regarding the ticket status (enroute)

      dataservice.scheduleenginesrv.SeTicket.save({
        id: _this.TicketId,
        link: 'ITER'
      }, null, utils.safeCallback(cb, function( /*err, resp*/ ) {
        notify.info("En-Route notification was sent successfully.", null, 3);
      }, notify.iferror));
    });

    _this.cmdDelay = ko.command(function(cb) {
      //@TODO
      // this method will set IsTechDelayed(ITD) status to true

      dataservice.scheduleenginesrv.SeTicket.save({
        id: _this.TicketId,
        link: 'ITD'
      }, null, utils.safeCallback(cb, function( /*err, resp*/ ) {
        notify.info("Delay notification was sent successfully.", null, 3);
      }, notify.iferror));
    });

    _this.cmdComplete = ko.command(function(cb) {
      //@TODO
      // this method will set IsTechCompleted(ITC) status to true

      //show confirmation note screen
      _this.layersVm.show(new TechTicketCompleteNoteViewModel({}), function onClose(result) {
        if (!result || !result.ClosingNote) {
          cb();
          return;
        }

        _this.data.ClosingNote(result.ClosingNote);
        _this.data.ConfirmationNo(result.ConfirmationNo);

        var ticketData = {
          TicketID: _this.TicketId,
          ClosingNote: _this.data.ClosingNote(),
          ConfirmationNo: _this.data.ConfirmationNo(),
        };

        //save completed ticket information
        dataservice.scheduleenginesrv.SeTicket.save({
          id: _this.TicketId,
          link: 'ITC',
          data: ticketData,
        }, null, utils.safeCallback(cb, function( /*err, resp*/ ) {
          notify.info("Ticket Completed.", null, 3);
          closeLayer(_this);
        }, notify.iferror));
      });
    });
    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
  }

  utils.inherits(TechTicketInfoViewModel, BaseViewModel);
  TechTicketInfoViewModel.prototype.viewTmpl = 'tmpl-technician-ticket-info';
  TechTicketInfoViewModel.prototype.width = "70%";
  TechTicketInfoViewModel.prototype.height = 'auto';

  TechTicketInfoViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;
    load_technicianTicketEquipments(_this, _this.technicianTicketInfoGvm, join.add());
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TechTicketInfoViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_technicianTicketEquipments(_this, gvm, cb) {
    //set list to empty
    gvm.list([]);
    dataservice.msaccountsetupsrv.accounts.read({
      id: _this.AccountId, //for real
      link: 'Equipment'
    }, gvm.list, cb);
  }

  return TechTicketInfoViewModel;
});
