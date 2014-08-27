define('src/scheduling/technician.ticket.info.vm', [
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/scheduling/technician.ticket.info.gvm',
  'ko',
  'src/ukov',
], function(
  dataservice,
  notify,
  utils,
  BaseViewModel,
  TechnicianTicketInfoGridViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    custName: {},
    custAddress: {},
    custPhone: {}
  };


  function TechTicketInfoViewModel(options) {
    var _this = this,
      obj;

    TechTicketInfoViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Technician Ticket Info';

    _this.data = ukov.wrap(_this.item || {
      custName: null,
      custAddress: null,
      custPhone: null
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


    _this.technicianTicketInfoGvm = new TechnicianTicketInfoGridViewModel({

    });

    //
    // events
    //



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

  return TechTicketInfoViewModel;
});
