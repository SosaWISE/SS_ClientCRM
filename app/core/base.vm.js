define("src/core/base.vm", [
  "src/core/strings",
  "src/core/helpers",
  "src/core/joiner",
  "src/core/notify",
  "src/core/utils",
  "ko"
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
      text: "No"
    }, {
      value: true,
      text: "Yes"
    },
  ];

  //
  // public members
  //
  BaseViewModel.prototype.ensureProps = function(propNames) {
    var _this = this;
    utils.ensureProps(_this, propNames);
  };
  BaseViewModel.prototype.getTemplate = function(vm) {
    return vm.viewTmpl;
  };

  BaseViewModel.prototype.initFocusFirst = function() {
    var _this = this;
    _this.initActiveFocus("focusFirst");
  };
  BaseViewModel.prototype.initActiveFocus = function(name) {
    var _this = this;
    if (_this[name]) {
      // do nothing duplicate calls
      return;
    }
    var obs = ko.observable(true);
    _this[name] = obs;
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the input field
        window.setTimeout(function() {
          obs(true);
        }, 100);
      }
    });
  };
  BaseViewModel.prototype.mixinLoad = function() {
    var _this = this;
    _this.load = load;
    if (!utils.isFunc(_this.onLoad)) {
      // only define if it has not already been defined
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
  BaseViewModel.prototype.reset = function(preventNested) {
    var _this = this;
    if (_this.loader) {
      _this.loader.reset();
    }
    if (!preventNested && _this.vms) {
      _this.vms.forEach(function(vm) {
        vm.reset();
      });
    }
  };
  BaseViewModel.prototype.reload = function(cb) {
    var _this = this;
    _this.reset();
    var routeData = _this.getRouteData();
    _this.load(routeData, {}, cb);
    if (utils.isFunc(_this.goTo)) { // this is more controller.vm territory... but so is getRouteData...
      _this.goTo(routeData);
    }
  };
  BaseViewModel.prototype.showReload = function() {
    var _this = this;
    var title = ko.unwrap(_this.title);
    var mayReload = _this.mayReload || utils.noop;
    mayReload(true);
    notify.confirm("Reload Section?", strings.format("Do you want to reload {0}?", title), function(result) {
      mayReload(false);
      if (result === "yes") {
        _this.reload();
      }
    });
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
      // we are done with activating
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
  BaseViewModel.prototype.vms = null; // nested view models
  BaseViewModel.prototype.destroy = function() {
    var _this = this;
    //
    _this.deactivate();
    // remove handlers
    if (_this.handler) {
      _this.handler.disposeAll();
      _this.handler.offAll();
    }
    // reset loader (but prevent resetting nested view models, since destroy will reset them)
    _this.reset(true);

    var allVms = [
      // nested view models
      ko.utils.peekObservable(_this.vms),
      // recursively destroy children (kind of specific to controller.vm,
      // but works for any childs array that is set)
      ko.utils.peekObservable(_this.childs),
      // other possible view models
      [
        ko.utils.peekObservable(_this.activeChild),
        ko.utils.peekObservable(_this.vm),
      ],
    ];
    allVms.forEach(function(vms) {
      if (!vms) {
        return;
      }
      vms.forEach(function(vm) {
        if (!vm) {
          return;
        }
        vm.destroy();
      });
    });

    // destroy self specific data
    _this.onDestroy();
  };
  BaseViewModel.prototype.onDestroy = function() {};

  //
  // static functions
  //
  BaseViewModel.ensureProps = function(obj, propNames) {
    utils.ensureProps(obj, propNames);
  };

  function load(routeData, extraData, cb) {
    ///////TESTING////////////////////////////
    // all too often i pass a join instead of a callback function...
    if (cb && !utils.isFunc(cb)) {
      throw new Error("load callback must be a function");
    }
    ///////TESTING////////////////////////////

    /* jshint validthis:true */
    var _this = this,
      loader = _this.loader,
      join;

    // call onLoad if it has not been called yet
    if (!loader.loaded() && !loader.loading()) {
      // add callback to list and set as loading
      loader(cb);

      join = joiner();
      _this.onLoad(routeData, extraData, join);
      join.when(function(errResp) {
        if (errResp) {
          notify.error(errResp);
        }
        // tell the loader we are done
        // - we already showed the error so do not pass it along
        loader.loadCb(errResp, false);
      });
    } else {
      // add callback to list of waiting callbacks
      loader(cb);
    }
  }

  return BaseViewModel;
});
