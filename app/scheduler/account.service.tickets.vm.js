define("src/scheduler/account.service.tickets.vm", [
  "slick",
  "src/scheduler/scheduler-helper",
  "src/scheduler/scheduler-cache",
  "src/scheduler/account.service.tickets.gvm",
  "src/scheduler/ticket.editor.vm",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/layers.vm",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  Slick,
  schedulerhelper,
  schedulercache,
  AccountServiceTicketsGridViewModel,
  TicketEditorViewModel,
  dataservice,
  ukov,
  ko,
  LayersViewModel,
  strings,
  notify,
  utils,
  ControllerViewModel
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
    AccountServiceTicketsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      // "layersVm",
    ]);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.gvm = new AccountServiceTicketsGridViewModel({
      edit: function(ticket, cb) {
        _this.layersVm.show(new TicketEditorViewModel({
          layersVm: _this.layersVm,
          item: utils.clone(ticket),
          serviceTypes: schedulercache.getList("serviceTypes").peek(),
          skills: schedulercache.getList("skills").peek(),
        }), function(model, deleted) {
          if (model) {
            schedulerhelper.ensureTypeNames(model);
          }
          cb(model, deleted);
        });
      },
    });

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

    _this.cmdRefreshGrid = ko.command(function(cb) {
      load_accountServiceTickets(_this.accountId, _this.gvm, cb);
    });
  }
  utils.inherits(AccountServiceTicketsViewModel, ControllerViewModel);
  AccountServiceTicketsViewModel.prototype.viewTmpl = "tmpl-scheduler-account-service-tickets";

  AccountServiceTicketsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.cmfid = routeData.masterid;
    _this.accountId = routeData.id;

    var typesJoin = join.create();
    schedulercache.ensure("serviceTypes", typesJoin.add());
    schedulercache.ensure("skills", typesJoin.add());
    schedulercache.ensure("statusCodes", typesJoin.add());

    load_customers(_this.cmfid, function(data) {
      data.sort(sortByCustomerTypeId);
      _this.customer = data[0];
    }, join.add());

    var cb = join.add();
    typesJoin.when(function(err) {
      if (err) {
        cb(err);
      } else {
        _this.cmdRefreshGrid.execute(cb);
      }
    });
  };

  function load_customers(masterId, setter, cb) {
    dataservice.qualify.customerMasterFiles.read({
      id: masterId,
      link: "customers",
    }, setter, cb);
  }

  function load_accountServiceTickets(accountId, gvm, cb) {
    gvm.setItems([]);
    dataservice.monitoringstationsrv.msAccounts.read({
      id: accountId,
      link: "serviceTickets",
    }, function(items) {
      items.forEach(function(item) {
        schedulerhelper.ensureTypeNames(item);
      });
      //
      gvm.setItems(items);
    }, cb);
  }

  return AccountServiceTicketsViewModel;
});
