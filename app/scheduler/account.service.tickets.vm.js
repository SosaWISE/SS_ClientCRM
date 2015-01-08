define("src/scheduler/account.service.tickets.vm", [
  "slick",
  "src/scheduler/scheduleticket.vm",
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
  ScheduleTicketViewModel,
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
            ensureTypeNames(model);
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
        item: {
          AccountId: _this.accountId,
          CustomerMasterFileId: _this.cmfid,
          StatusCodeId: 1,
        },
        serviceTypes: schedulercache.getList("serviceTypes").peek(),
        skills: schedulercache.getList("skills").peek(),
      }), function(model, deleted, schedule) {
        if (model) {
          ensureTypeNames(model);
          _this.gvm.insertItem(model);
          if (schedule) {
            scheduleTicket();
          }
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

    var cb = join.add();
    typesJoin.when(function(err) {
      if (err) {
        cb(err);
      } else {
        _this.cmdRefreshGrid.execute(cb);
      }
    });
  };

  function load_accountServiceTickets(accountId, gvm, cb) {
    gvm.setItems([]);
    dataservice.monitoringstationsrv.msAccounts.read({
      id: accountId,
      link: "serviceTickets",
    }, function(items) {
      items.forEach(ensureTypeNames);
      //
      gvm.setItems(items);
    }, cb);
  }

  function ensureTypeNames(item) {
    var statusCodesMap = schedulercache.getMap("statusCodes");
    var serviceTypesMap = schedulercache.getMap("serviceTypes");

    var mapItem;
    //
    mapItem = statusCodesMap[item.StatusCodeId];
    item.StatusCode = mapItem ? mapItem.Name : item.StatusCodeId;
    //
    mapItem = serviceTypesMap[item.ServiceTypeId];
    item.ServiceType = mapItem ? mapItem.Name : item.ServiceTypeId;
  }

  function scheduleTicket(_this, ticket, cb) {
    _this.layersVm.show(new ScheduleTicketViewModel({
      pcontroller: _this,
      id: "schedule",
      title: "Schedule",
      layersVm: _this.layersVm,

      startHour: 5,
      endHour: 24,
    }), cb);
  }

  return AccountServiceTicketsViewModel;
});
