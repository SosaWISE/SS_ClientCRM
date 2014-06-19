define('src/core/base.vm', [
  'src/core/strings',
  'src/core/helpers',
  'src/core/joiner',
  'src/core/notify',
  'src/core/utils',
  'ko'
], function(
  strings,
  helpers,
  joiner,
  notify,
  utils,
  ko
) {
  "use strict";

  function BaseViewModel(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }

    // sub-classes should call this manually
    // if they want the load functionality
    // _this.mixinLoad();

    _this.active = ko.observable(false);
  }

  BaseViewModel.prototype.name = null;
  BaseViewModel.prototype.viewTmpl = null;
  BaseViewModel.prototype.booleanOptions = [true, false];
  BaseViewModel.prototype.yesNoOptions = [ //
    {
      value: false,
      text: 'No'
    }, {
      value: true,
      text: 'Yes'
    },
  ];

  //
  // public members
  //
  BaseViewModel.prototype.ensureProps = function(propNames) {
    var _this = this;
    BaseViewModel.ensureProps(_this, propNames);
  };
  BaseViewModel.prototype.getTemplate = function(vm) {
    return vm.viewTmpl;
  };

  BaseViewModel.prototype.mixinLoad = function() {
    var _this = this;
    _this.load = load;
    if (!utils.isFunc(_this.onLoad)) {
      // only define if it hasn't already been defined
      _this.onLoad = utils.no_op;
    }
    _this.loader = helpers.onetimer();
    _this.loading = _this.loader.loading;
    _this.loaded = _this.loader.loaded;
    _this.loadErr = _this.loader.loadErr;
  };
  BaseViewModel.prototype.getRouteData = function() {
    return {};
  };
  BaseViewModel.prototype.reload = function(cb) {
    var _this = this,
      canReload = _this.canReload();
    if (canReload) {
      _this.loader.reset();
      _this.load(_this.getRouteData(), {}, cb);
    } else {
      // call now
      cb();
    }
    // return true if reloaded
    return canReload;
  };
  BaseViewModel.prototype.canReload = function() {
    var _this = this;
    return ko.isObservable(_this.mayReload) && _this.loader.canReset();
  };
  BaseViewModel.prototype.attemptReload = function() {
    var _this = this,
      title = ko.unwrap(_this.title);
    if (_this.canReload()) {
      _this.mayReload(true);
      notify.confirm('Reload Section?',
        strings.format('Do you want to reload {0}?', title),
        function(result) {
          _this.mayReload(false);
          if (result === 'yes') {
            if (!_this.reload()) {
              notify.warn(strings.format('Failed to reload {0}?', title));
            }
          }
        });
    } else if (ko.isObservable(_this.mayReload)) {
      notify.warn(strings.format('Currently can\'t reload {0}?', title), null, 5);
    } else {
      console.log(title, 'reload not enabled');
    }
  };
  // this will be over written when mixinLoad is called
  BaseViewModel.prototype.load = function(routeData, extraData, cb) {
    cb();
  };
  // activate can be async or synchronous depending
  // on what happens in the load function
  BaseViewModel.prototype.activate = function(routeCtx) {
    var _this = this;

    // immdediately set as active
    _this.active(true);
    // store last route
    _this._lastRouteData = routeCtx.routeData;
    // load self
    _this.load(routeCtx.routeData, routeCtx.extraData, function() {
      // check if routeCtx is still active
      if (!routeCtx.active()) {
        return;
      }
      // active this controller
      _this.onActivate(routeCtx);
      // we're done with activating
      routeCtx.done();
    });
  };
  BaseViewModel.prototype.onActivate = function( /*routeCtx*/ ) {};

  // synchronous
  BaseViewModel.prototype.deactivate = function() {
    var _this = this;
    _this.onDeactivate();
    _this.active(false);
  };
  BaseViewModel.prototype.onDeactivate = function() {};

  BaseViewModel.prototype.canClose = function() {
    var _this = this;
    return !_this.closeMsg();
  };
  BaseViewModel.prototype.closeMsg = function() {
    // should return a non-empty string describing why this vm cannot be closed
    return null;
  };

  //
  // static functions
  //
  BaseViewModel.ensureProps = function(obj, propNames) {
    propNames.forEach(function(name) {
      if (obj[name] == null) {
        throw new Error('missing ' + name);
      }
    });
  };

  function load(routeData, extraData, cb) {
    ///////TESTING////////////////////////////
    // all too often i pass a join instead of a callback function...
    if (cb && !utils.isFunc(cb)) {
      throw new Error('load callback must be a function');
    }
    ///////TESTING////////////////////////////

    /* jshint validthis:true */
    var _this = this,
      loader = _this.loader,
      join;

    // call onLoad if it hasn't been called yet
    if (!loader.loaded() && !loader.loading()) {
      // add callback to list and set as loading
      loader(cb);

      join = joiner();
      _this.onLoad(routeData, extraData, join);
      join.when(function(errResp) {
        if (errResp) {
          notify.error(errResp);
        }
        // tell the loader we're done
        // - we already showed the error so don't pass it along
        loader.loadCb(errResp, true);
      });
    } else {
      // add callback to list of waiting callbacks
      loader(cb);
    }
  }

  return BaseViewModel;
});
