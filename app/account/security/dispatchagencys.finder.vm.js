define('src/account/security/dispatchagencys.finder.vm', [
  'src/dataservice',
  'ko',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/ukov',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  dataservice,
  ko,
  RowEvent,
  SlickGridViewModel,
  ukov,
  notify,
  BaseViewModel,
  utils
) {
  "use strict";

  var schema;

  schema = {
    _model: true,

    CityName: {
      validators: [
        ukov.validators.isRequired('City name is required'),
      ],
    },
    ZipCode: {
      validators: [
        ukov.validators.isRequired('Zip code is required'),
      ],
    },
  };

  function DispatchAgencysFinderViewModel(options) {
    var _this = this;
    DispatchAgencysFinderViewModel.super_.call(_this, options);

    _this.focusFirst = ko.observable();

    _this.data = ukov.wrap({
      CityName: '',
      ZipCode: '',
    }, schema);

    _this.gvm = new SlickGridViewModel({
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(item) {
            console.log(item);
            _this.selectedAgency = item;
            _this.cmdSelect.execute();
          },
        }),
      ],
      columns: [ //
        {
          id: 'ID',
          name: 'ID',
          field: 'DispatchAgencyID',
          width: 30,
        }, {
          id: 'AgencyType',
          name: 'Agency Type',
          field: 'DispatchAgencyTypeName',
        }, {
          id: 'AgencyNo',
          name: 'Agency #',
          field: 'AgencyNo',
        }, {
          id: 'AgencyName',
          name: 'Agency Name',
          field: 'AgencyName',
        }, {
          id: 'DispatchPhone',
          name: 'Dispatch Phone',
          field: 'DispatchPhone',
        },
      ],
      onSelectedRowsChanged: function(rows) {
        _this.selectedAgency = rows[0];
      },
    });

    //
    // events
    //
    // _this.cmdCancel = ko.command(function(cb) {
    //   closeLayer(null);
    //   cb();
    // }, function(busy) {
    //   return !busy && !_this.cmdSelect.busy();
    // });
    _this.cmdFind = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), 7);
        return cb(_this.data.errMsg());
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);

      _this.gvm.list([]);
      setTimeout(function() {
        _this.maxLength = _this.maxLength || 5;
        while (_this.gvm.list().length < _this.maxLength) {
          _this.gvm.list.push({
            DispatchAgencyID: _this.gvm.list().length + 1,
            DispatchAgencyTypeName: model.CityName + ': DispatchAgencyTypeName',
            AgencyNo: 'AgencyNo',
            AgencyName: 'AgencyName',
            DispatchPhone: 'DispatchPhone',
          });
        }
        _this.maxLength--;
        cb();
      }, 2000);
      //@TODO: get correct api path and response format
      // dataservice.boh.boh.read({
      //   query: model,
      // }, null, utils.safeCallback(null, function(err, resp) {
      //   cb();
      //   _this.gvm.list(resp.Value);
      // }, function(err) {
      //   notify.notify('error', err.Message);
      // }));
    }, function(busy) {
      return !busy && !_this.cmdSelect.busy();
    });
    _this.cmdSelect = ko.command(function(cb) {
      if (!_this.selectedAgency) {
        notify.notify('warn', 'Please select a dispatch agency', 7);
        cb();
        return;
      }
      alert('currently i do nothing...');
      setTimeout(function() {
        cb();
        closeLayer(null);
      }, 5000);
      //@TODO: get correct api path and response format
      // dataservice.boh.boh.save({}, null, utils.safeCallback(null, function(err, resp) {
      //   cb();
      //   closeLayer(resp.Value);
      // }, function(err) {
      //   notify.notify('error', err.Message);
      // }));
    }, function(busy) {
      return !busy && _this.gvm.list().length;
    });

    function closeLayer(result) {
      //@NOTE: command callbacks should be called before calling closeLayer
      if (_this.layer) {
        _this.layer.close(result);
      }
    }


    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(DispatchAgencysFinderViewModel, BaseViewModel);
  DispatchAgencysFinderViewModel.prototype.viewTmpl = 'tmpl-security-dispatchagencys_finder';
  DispatchAgencysFinderViewModel.prototype.width = 600;
  DispatchAgencysFinderViewModel.prototype.height = 'auto';

  DispatchAgencysFinderViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSelect.busy()) {
      msg = 'Please wait for the agency to be selected.';
    }
    return msg;
  };

  return DispatchAgencysFinderViewModel;
});
