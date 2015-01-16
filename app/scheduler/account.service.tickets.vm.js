define("src/scheduler/account.service.tickets.vm", [
  "slick",
  "src/scheduler/scheduler-helper",
  "src/scheduler/scheduler-cache",
  "src/scheduler/ticket.editor.vm",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/layers.vm",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/scheduler/service.tickets.vm",
], function(
  Slick,
  schedulerhelper,
  schedulercache,
  TicketEditorViewModel,
  dataservice,
  ukov,
  ko,
  LayersViewModel,
  strings,
  notify,
  utils,
  ServiceTicketsViewModel
) {
  "use strict";

  var customerTypePrecedence = {
    PRI: 1,
    LEAD: 1,
    SEC: 2,
    BILL: 3,
    SHIP: 4,
  };

  function sortByCustomerTypeId(a, b) {
    var aP = customerTypePrecedence[a.CustomerTypeId] || 9,
      bP = customerTypePrecedence[b.CustomerTypeId] || 9;
    return aP - bP;
  }


  function AccountServiceTicketsViewModel(options) {
    var _this = this;
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });
    AccountServiceTicketsViewModel.super_.call(_this, options);
    // ControllerViewModel.ensureProps(_this, [
    //   "layersVm",
    // ]);

    //
    // events
    //
    _this.cmdAddServiceTicket = ko.command(function(cb) {
      _this.layersVm.show(new TicketEditorViewModel({
        layersVm: _this.layersVm,
        item: schedulerhelper.ensureTypeNames({
          ID: 0,
          //
          AccountId: _this.accountId,
          CustomerMasterFileId: _this.cmfid,
          StatusCodeId: 1,
          //
          FirstName: _this.customer.FirstName,
          MiddleName: _this.customer.MiddleName,
          LastName: _this.customer.LastName,
          StreetAddress: _this.customer.StreetAddress,
          StreetAddress2: _this.customer.StreetAddress2,
          City: _this.customer.City,
          StateId: _this.customer.StateId,
          PostalCode: _this.customer.PostalCode,
        }),
        serviceTypes: schedulercache.getList("serviceTypes").peek(),
        skills: schedulercache.getList("skills").peek(),
      }), function(model) {
        if (model) {
          schedulerhelper.ensureTypeNames(model);
          _this.gvm.insertItem(model);
        }
        cb();
      });
    }, function(busy) {
      return !busy && !_this.cmdRefreshGrid.busy();
    });
  }
  utils.inherits(AccountServiceTicketsViewModel, ServiceTicketsViewModel);
  AccountServiceTicketsViewModel.prototype.viewTmpl = "tmpl-scheduler-account_service_tickets";

  AccountServiceTicketsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.cmfid = routeData.masterid;
    _this.accountId = routeData.id;

    load_customers(_this.cmfid, function(data) {
      data.sort(sortByCustomerTypeId);
      _this.customer = data[0];
    }, join.add());

    // call base
    AccountServiceTicketsViewModel.super_.prototype.onLoad.call(_this, routeData, extraData, join);
  };

  AccountServiceTicketsViewModel.prototype.loadServiceTickets = function(setter, cb) { // overrides base
    var _this = this;
    load_accountServiceTickets(_this.accountId, setter, cb);
  };

  function load_customers(masterId, setter, cb) {
    dataservice.qualify.customerMasterFiles.read({
      id: masterId,
      link: "customers",
    }, setter, cb);
  }

  function load_accountServiceTickets(accountId, setter, cb) {
    dataservice.monitoringstationsrv.msAccounts.read({
      id: accountId,
      link: "serviceTickets",
    }, setter, cb);
  }

  return AccountServiceTicketsViewModel;
});
