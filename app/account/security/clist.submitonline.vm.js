define('src/account/security/clist.submitonline.vm', [
  'src/account/security/dispatchagencys.finder.vm',
  'src/account/security/dispatchagency.editor.vm',
  'src/account/security/dispatchagencys.gvm',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  DispatchAgencysFinderViewModel,
  DispatchAgencyEditorViewModel,
  DispatchAgencysGridViewModel,
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSubmitOnlineViewModel(options) {
    var _this = this;
    CListSubmitOnlineViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.mayReload = ko.observable(false);
    _this.gvm = new DispatchAgencysGridViewModel({
      edit: function(agency, cb) {
        showDispatchAgencyEditor(_this, agency, cb);
      },
    });

    _this.submissionData = ko.observable();

    //
    // events
    //
    _this.cmdFind = ko.command(function(cb) {
      _this.layersVm.show(new DispatchAgencysFinderViewModel(), function(result) {
        if (result) {
          alert(result);
        }
        cb();
      });
    });
    _this.cmdAdd = ko.command(function(cb) {
      showDispatchAgencyEditor(_this, null, function(model, deleted) {
        if (model && !deleted) {
          // add new agency
          _this.gvm.list.push(model);
          // // reload grid
          // load_dispatchAgencys(_this, function() {
          //   cb(null);
          // });
        }
        cb();
      });
    });
    _this.cmdSubmit = ko.command(function(cb) {
      dataservice.monitoringstationsrv.msAccounts.save({
        data: {
          AccountId: _this.accountId,
        },
      }, null, utils.safeCallback(cb, function(err, resp) {
        console.log(resp);
        //@TODO: do stuff after submit online, but what???

        if (resp && resp.Value) {
          if (resp.Value.WasSuccessfull) {
            notify.ok('Successfully submitted online!', null, 7);
            resp.Value.Msg = 'Submission Succeeded!';
          } else {
            notify.warn('Failed to submit account online.', null, 7);
            resp.Value.Msg = 'Submission Failed...';
          }
          _this.submissionData(resp.Value);
        }
      }, function(err) {
        notify.error(err);
      }));
    });
  }
  utils.inherits(CListSubmitOnlineViewModel, ControllerViewModel);
  CListSubmitOnlineViewModel.prototype.viewTmpl = 'tmpl-security-clist_submitonline';

  CListSubmitOnlineViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountId = routeData.id;

    load_dispatchAgencys(_this, join.add());
    //@TODO: load account status
    //@TODO: load dispatch agency types
  };

  function load_dispatchAgencys(_this, cb) {
    _this.gvm.list([]);

    //@TODO: actually load data
    setTimeout(function() {
      while (_this.gvm.list().length < 3) {
        _this.gvm.list.push({
          DaAssignmentId: _this.gvm.list().length + 1,
          DispatchAgencyTypeName: 'DispatchAgencyTypeName',
          CsNo: 'CsNo',
          AgencyName: 'AgencyName',
          DispatchPhone: 'DispatchPhone',
          MonitoringStationVerfied: 'MonitoringStationVerfied',
        });
      }
      cb();
    }, 1000);
    // dataservice.boh.boh.read({}, null, utils.safeCallback(cb, function(err, resp) {
    //   _this.gvm.list(resp.Value);
    // }, function(err) {
    //   notify.error(err);
    // }));
  }

  function showDispatchAgencyEditor(_this, agency, cb) {
    agency = utils.clone(agency);
    _this.layersVm.show(new DispatchAgencyEditorViewModel({
      item: agency,
    }), cb);
  }

  return CListSubmitOnlineViewModel;
});
