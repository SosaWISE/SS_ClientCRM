define('src/core/base.vm', [
  'src/core/mixinLoad',
  'ko'
], function(
  mixinLoad,
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

  // set function that adds load functionality
  BaseViewModel.prototype.mixinLoad = mixinLoad;


  BaseViewModel.prototype.name = null;
  BaseViewModel.prototype.viewTmpl = null;
  BaseViewModel.prototype.booleanOptions = [true, false];
  BaseViewModel.prototype.yesNoOptions = [
    {
      value: false,
      text: 'No'
    },
    {
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

  // this will be over written if mixinLoad is called
  BaseViewModel.prototype.load = function(routeData, extraData, cb) {
    cb();
  };
  // activate can be async or synchronous depending
  // on whether mixinLoad has been called or not
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


  return BaseViewModel;
});
