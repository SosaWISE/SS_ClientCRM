define('src/scheduling/technician.ticket.info.vm', [
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/scheduling/technician.ticket.info.gvm',
  'src/core/joiner',
  'ko',
  'src/ukov',
], function(
  dataservice,
  notify,
  utils,
  BaseViewModel,
  TechnicianTicketInfoGridViewModel,
  joiner,
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
  };


  function TechTicketInfoViewModel(options) {
    var _this = this,
      join = joiner(),
      obj;

    TechTicketInfoViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Technician Ticket Info';

    _this.data = ukov.wrap(_this.item || {
      custName: null,
      custAddress: null,
      custPhone: null,
      TechTicketNotes: null
    }, schema);

    obj = _this.rowObj;

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

    load_technicianTicketEquipments(_this, join.add());

    _this.technicianTicketInfoGvm = new TechnicianTicketInfoGridViewModel({

    });

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
      }, null, utils.safeCallback(cb, function(err, resp) {

        console.log("TechEnRoute:" + JSON.stringify(resp));

        if (resp && resp.Value && !err) {
          notify.info("En-Route notification was sent successfully.", null, 3);
        }

      }, function(err) {
        notify.error(err);
      }));

    });

    _this.cmdDelay = ko.command(function(cb) {
      //@TODO 
      // this method will set IsTechDelayed(ITD) status to true      

      dataservice.scheduleenginesrv.SeTicket.save({
        id: _this.TicketId,
        link: 'ITD'
      }, null, utils.safeCallback(cb, function(err, resp) {

        console.log("TechDelayed:" + JSON.stringify(resp));

        if (resp && resp.Value && !err) {
          notify.info("Delay notification was sent successfully.", null, 3);
        }

      }, function(err) {
        notify.error(err);
      }));

    });

    _this.cmdComplete = ko.command(function(cb) {
      //@TODO 
      // this method will set IsTechCompleted(ITC) status to true      

      dataservice.scheduleenginesrv.SeTicket.save({
        id: _this.TicketId,
        link: 'ITC'
      }, null, utils.safeCallback(cb, function(err, resp) {

        console.log("Ticket Completed:" + JSON.stringify(resp));

        if (resp && resp.Value && !err) {
          notify.info("Ticket Completed.", null, 3);

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

  utils.inherits(TechTicketInfoViewModel, BaseViewModel);
  TechTicketInfoViewModel.prototype.viewTmpl = 'tmpl-technician-ticket-info';
  TechTicketInfoViewModel.prototype.width = "70%";
  TechTicketInfoViewModel.prototype.height = 'auto';



  TechTicketInfoViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) {
    //var _this = this;
    //  join = join;

    //load_technicianTicketEquipments(_this, _this.technicianTicketInfoGvm, join.add());
    //alert(JSON.stringify(_this.rowObj));

  };

  TechTicketInfoViewModel.prototype.onActivate = function( /*routeData*/ ) {};

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TechTicketInfoViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function load_technicianTicketEquipments(_this, cb) {

    dataservice.msaccountsetupsrv.accounts.read({
      id: _this.AccountId, //for real
      //id: 100290, //for testing
      link: 'Equipment'
    }, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("TechTicketEquipments:" + JSON.stringify(resp.Value));

        //set list to empty
        _this.technicianTicketInfoGvm.list([]);

        //populate ticket equipment list
        for (var x = 0; x < resp.Value.length; x++) {
          _this.technicianTicketInfoGvm.list.push(resp.Value[x]);
        }

      } else {
        notify.error(err);
      }
    }));

  }

  return TechTicketInfoViewModel;
});
