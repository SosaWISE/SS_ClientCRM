define('src/alarm/client.vm', [
  'ko',
  'src/ukov',
  'src/config',
  'src/alarm/socket',
  'src/core/jsonhelpers',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ko,
  ukov,
  config,
  Socket,
  jsonhelpers,
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
    _this.connectText = ko.computed(function() {
      var socket = _this.socket();
      if (socket && socket.connected()) {
        return "Disconnect";
      } else {
        return "Connect";
      }
    });

    //
    // events
    //
    _this.clearLog = function() {
      _this.log([]);
    };
    _this.cmdConnect = ko.command(function(cb) {
      var socket = _this.socket.peek();
      if (!socket) {
        _this.logText('connecting...');
        socket = new Socket(config.wsBasePath + '/client/ws?alarmid=' + _this.alarmid.getValue());
        _this.alarmid.markClean();
        socket.onopen = function() {
          _this.logText('connected');
          socket.service().get('/arm', {}, null, utils.safeCallback(cb, function(err, resp, ctx) {
            _this.logText('CALLRESULT - get alarm status - ' + stringify(ctx.pkg));
            _this.data.setValue(resp.Value);
            _this.data.markClean(resp.Value, true);
          }, notify.error));
          _this.logText('CALL - get alarm status - ' + stringify(socket.getLastSent()));
        };
        socket.onclose = function() {
          _this.logText('disconnected');
          _this.socket(null);
        };
        socket.onerror = function(evt) {
          _this.logText('error: ' + stringify(evt));
        };
        socket.on('system:state', _this, function(pkg) {
          var data = pkg.data;
          _this.data.setValue(data);
          _this.data.markClean(data, true);
          _this.logText('EVENT - handled ' + stringify(pkg));
        });
        socket.on('alarm:triggered', _this, function(pkg) {
          _this.logText('EVENT - handled ' + stringify(pkg));
        });
        _this.socket(socket);
      } else if (!socket.connected()) {
        _this.logText('reconnecting...');
        socket.reconnect();
      } else {
        _this.logText('disconnecting...');
        socket.disconnect();
        _this.socket(null);
      }
      cb();
    }, function(busy) {
      var socket = _this.socket();
      if (!busy && socket && socket.connected()) {
        // allow disconnecting
        return true;
      }
      // allow connecting and reconnecting
      return !busy && _this.alarmid.isValid() && (!socket || (socket && !socket.connected()));
    });
    _this.cmdSaveArmStatus = ko.command(function(cb) {
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
      var socket = _this.socket.peek(),
        model = _this.data.getValue();
      socket.service().post('/arm', model, null, utils.safeCallback(cb, function(err, resp, ctx) {
        _this.logText('CALLRESULT - set alarm status - ' + stringify(ctx.pkg));
        _this.data.markClean(model, true);
      }, notify.error));
      _this.logText('CALL - set alarm status - ' + stringify(socket.getLastSent()));
    }, function(busy) {
      var socket = _this.socket();
      return !busy && socket && socket.connected();
    });
  }
  utils.inherits(ClientViewModel, BaseViewModel);

  ClientViewModel.prototype.dispose = function() {
    var _this = this,
      socket = _this.socket();
    if (socket) {
      socket.disconnect();
    }
  };

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
      text: 'Armed (Stay)',
    }, {
      value: 'away',
      text: 'Armed (Away)',
    },
  ];

  function stringify(data) {
    return jsonhelpers.stringify(data, '    ');
  }

  return ClientViewModel;
});
