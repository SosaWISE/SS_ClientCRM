define([
  'notify',
  'util/utils',
  'vm.base',
  'ko',
  'ukov',
  'dataservice'
], function(
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  dataservice
) {
  "use strict";

  /////MOCKING//////////////////////
  var callCount = 0;
  dataservice.qualify.salesRepRead = function(data, cb) {
    setTimeout(function() {
      callCount++;
      var resp;
      if (callCount % 2 === 0) {
        resp = {
          Code: 1,
          Message: 'The code is 1, which is bad... i think.',
          Value: null,
        };
      } else {
        resp = {
          Code: 0,
          Message: '',
          Value: {
            SalesRepID: data.SalesRepID,
            img: 'https://secure.gravatar.com/avatar/f47bda756ab7abfaeb7b5e1b59d5edc9?s=100&r=pg&d=https%3A%2F%2Fkanbanflow.com%2Fimg%2Fgd.png',
            fullname: 'Andres Sosa',
            season: 'Summer 2013',
            office: 'Tampa 1',
            phone: '(123) 123-1234',
            email: 'e@mail.com',
          },
        };
      }

      cb(resp);
    }, 1000 * 2);
  };
  /////MOCKING//////////////////////

  ukov.schema['find-rep'] = {
    SalesRepID: {
      converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Rep ID is required'),
        ukov.validators.isPattern(/^[a-z]{4}[0-9]{3}$/i, 'invalid Rep ID. expected format: NAME001'),
      ],
    },
    // SeasonId: {},
    // TeamLocationId: {},

    img: {},
    fullname: {},
    season: {},
    office: {},
    phone: {},
    email: {},
  };

  function FindRepViewModel(options) {
    var _this = this;
    FindRepViewModel.super_.call(_this, options);

    _this.focusRepID = ko.observable(false);
    _this.repData = ukov.wrapModel({}, 'find-rep', 'find-rep-vm');
    _this.loading = ko.observable(false);
    _this.loaded = ko.observable(false);
    _this.repResult = ko.observable(null);

    /////TESTING//////////////////////
    _this.repData.SalesRepID('sosa001');
    /////TESTING//////////////////////

    //
    // events
    //
    _this.cmdFind = ko.command(
      function(cb) {
        _this.repData.SalesRepID.validate();
        if (!_this.repData.SalesRepID.isValid()) {
          notify.notify('warn', _this.repData.SalesRepID.errMsg(), 7);
          return cb();
        }

        _this.loaded(false);
        var model = _this.repData.getValue();
        dataservice.qualify.salesRepRead(model, function(resp) {
          if (resp.Code !== 0) {
            notify.notify('warn', resp.Message, 10);
            _this.focusRepID(true);
          } else {
            _this.repData.markClean(resp.Value, true);
            _this.repResult(resp.Value);
            _this.loaded(true);
          }
          cb();
        });
      }
    );

    _this.loading = _this.cmdFind.isExecuting;
  }
  utils.inherits(FindRepViewModel, BaseViewModel);
  FindRepViewModel.prototype.viewTmpl = 'tmpl-rep_find';
  FindRepViewModel.prototype.width = 350;
  FindRepViewModel.prototype.height = 300;

  FindRepViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the rep id
    setTimeout(function() {
      _this.focusRepID(true);
    }, 100);
  };

  return FindRepViewModel;
});
