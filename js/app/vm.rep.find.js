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
      if (callCount % 2 === 1) {
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
            repId: data.repId,
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
    }, 1000 * 0.5);
  };
  /////MOCKING//////////////////////

  ukov.schema['find-rep'] = {
    repId: {
      converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Rep ID is required'),
        ukov.validators.isPattern(/^[a-z]{4}[0-9]{3}$/i, 'invalid Rep ID. expected format: NAME001'),
      ],
    },
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

    _this.focusRepID = ko.observable(true);
    _this.repData = ukov.wrapModel({}, 'find-rep', 'find-rep-vm');
    _this.loading = ko.observable(false);
    _this.loaded = ko.observable(false);

    _this.repData.repId('sosa001');

    //
    // events
    //
    _this.clickFind = function() {
      var repId = _this.repData.model.repId;

      if (!_this.repData.repId.isValid()) {
        alert('invalid');
        return;
      }

      _this.loaded(false);
      _this.loading(true);
      dataservice.qualify.salesRepRead({
        repId: repId
      }, function(resp) {
        _this.loading(false);

        if (resp.Code !== 0) {
          notify.notify('warn', resp.Message, 10);
          _this.focusRepID(true);
          return;
        }

        _this.repData.markClean(resp.Value, true);
        delete resp.Value.repId; // this value is entered by the user so don't overwrite it
        _this.repData.setVal(resp.Value, true);
        _this.loaded(true);
      });
    };
  }
  utils.inherits(FindRepViewModel, BaseViewModel);
  FindRepViewModel.prototype.viewTmpl = 'tmpl-rep_find';

  return FindRepViewModel;
});
