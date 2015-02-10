define("src/scheduler/ticket.close.vm", [
  "src/scheduler/scheduler-helper",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  schedulerhelper,
  dataservice,
  ukov,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema;
  schema = {
    _model: true,
    Version: {},
    CompletedNote: {
      validators: [
        ukov.validators.isRequired("Closing Note is required"),
      ],
    },
    MSConfirmation: {
      // validators: [
      //   ukov.validators.isRequired("Monitoring Station Confirmation is required"),
      // ],
    },
    DealerConfirmation: {
      validators: [
        ukov.validators.isRequired("Dealer Confirmation is required"),
      ],
    },
  };

  function TicketCloseViewModel(options) {
    var _this = this;
    TicketCloseViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "ticketid",
      "version",
    ]);

    _this.data = ukov.wrap({
      Version: _this.version,
    }, schema);

    //
    // events
    //
    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    _this.cmdCloseTicket = ko.command(function(cb) {
      if (!_this.data.isValid.peek()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb();
      }

      var model = _this.data.getValue();
      dataservice.ticketsrv.serviceTickets.save({
        id: _this.ticketid,
        link: "Close",
        data: model,
      }, function(val) {
        schedulerhelper.afterTicketLoaded(val);
        _this.layerResult = val;
        closeLayer(_this);
      }, cb);
    });
  }

  utils.inherits(TicketCloseViewModel, BaseViewModel);
  TicketCloseViewModel.prototype.viewTmpl = "tmpl-scheduler-ticket_close";
  TicketCloseViewModel.prototype.width = 350;
  TicketCloseViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TicketCloseViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  TicketCloseViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (!_this.layerResult) {
      if (_this.cmdCloseTicket.busy()) {
        msg = "Please wait for ticket to be closed.";
      }
    }
    return msg;
  };

  return TicketCloseViewModel;
});
