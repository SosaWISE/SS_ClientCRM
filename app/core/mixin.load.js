define('src/core/mixin.load', [
  'src/core/helpers',
  'src/core/joiner',
  'src/core/notify',
], function(
  helpers,
  joiner,
  notify
) {
  "use strict";


  function initMixinLoad() {
    /* jshint validthis:true */
    var _this = this;
    _this.loader = helpers.onetimer();
    _this.loading = _this.loader.loading;
    _this.loaded = _this.loader.loaded;
    _this.loadErr = _this.loader.loadErr;
  }

  function load(routeData, cb) {
    /* jshint validthis:true */
    var _this = this,
      loader = _this.loader,
      join;

    if (!loader) {
      console.warn('call initMixinLoad before calling load');
      return;
    }

    // call onLoad if it hasn't been called yet
    if (!loader.loaded() && !loader.loading()) {
      // add callback to list and set as loading
      loader(cb);

      join = joiner();
      _this.onLoad(routeData, join);
      join.when(function(errResp) {
        if (errResp) {
          notify.notify('error', errResp.Message);
        }
        // tell the loader we're done
        loader.loadCb(errResp);
      });
    } else {
      // add callback to list of waiting callbacks
      loader(cb);
    }
  }

  function onLoad_no_op( /*routeData, join*/ ) {}


  // parameter can be _this or prototype
  return function mixin_load(_this) {
    _this.initMixinLoad = initMixinLoad;
    _this.load = load;
    if (typeof(_this.onLoad) !== 'function') {
      // only define if it hasn't already been defined
      _this.onLoad = onLoad_no_op;
    }
    return _this;
  };
});
