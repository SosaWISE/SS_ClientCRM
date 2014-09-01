define('src/alarm/client.vm', [
  'ko',
  'src/ukov',
  'src/config',
  'src/alarm/socket',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ko,
  ukov,
  config,
  Socket,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema;

  schema = {
    _model: true,

    armStatus: {},
  };

  function ClientViewModel(options) {
    var _this = this;
    ClientViewModel.super_.call(_this, options);
    // BaseViewModel.ensureProps(_this, []);
    _this.mixinLoad();

    _this.alarmid = ukov.wrap('bob', {
      validators: [
        ukov.validators.isRequired('Please enter an Alarm ID.'),
      ],
    });
    _this.data = ukov.wrap({
      // armStatus: _this.armStatusOptions[0].value,
    }, schema);
    _this.data.armStatusCvm = new ComboViewModel({
      selectedValue: _this.data.armStatus,
      list: _this.armStatusOptions,
    });

    _this.log = ko.observableArray();
    _this.focusFirst = ko.observable(false);
    _this.socket = ko.observable(null);
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

    //
    // events
    //
    _this.cmdConnect = ko.command(function(cb) {
      var socket = _this.socket.peek();
      if (!socket) {
        _this.logText('connecting...');
        socket = new Socket(config.wsBasePath + '/client/ws?alarmid=' + _this.alarmid.getValue());
        socket.onopen = function() {
          _this.logText('connected');
        };
        socket.onclose = function() {
          _this.logText('disconnected');
        };
        socket.onerror = function(evt) {
          _this.logText('error', JSON.stringify(evt));
        };
        socket.on('system:state', _this, function(data) {
          _this.data.setValue(data);
          _this.data.markClean(data, true);
          _this.logText('event - system:state ' + JSON.stringify(data));
        });
        _this.socket(socket);
      } else {
        _this.logText('reconnecting...');
        socket.reconnect();
      }
      cb();
    }, function(busy) {
      var socket = _this.socket();
      return !busy && _this.alarmid.isValid() && (!socket || (socket && !socket.connected()));
    });
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      if (_this.data.isClean()) {
        notify.info('Nothing to save', null, 2);
        cb();
        return;
      }
      var model = _this.data.getValue();
      _this.logText('saving system state...');
      _this.socket.peek().post('/arm', model, null, utils.safeCallback(cb, function(err, resp) {
        console.log('ws call result:', resp);
        _this.data.markClean(model, true);
        _this.logText('saved system state');
      }, notify.error));
    }, function(busy) {
      var socket = _this.socket();
      return !busy && socket && socket.connected();
    });
  }
  utils.inherits(ClientViewModel, BaseViewModel);

  ClientViewModel.prototype.logText = function(text) {
    var _this = this;
    _this.log.unshift({
      time: new Date(),
      text: text,
    });
  };

  ClientViewModel.prototype.armStatusOptions = [ //
    {
      value: 'disarmed',
      text: 'Disarmed',
    }, {
      value: 'stay',
      text: 'Arm (Stay)',
    }, {
      value: 'away',
      text: 'Arm (Away)',
    },
  ];

  return ClientViewModel;
});
