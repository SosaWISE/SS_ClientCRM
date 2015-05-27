define("src/salesmap/gmap.vm", [
  "gmaps",
  "ko",
  "src/core/utils",
  "src/core/base.vm",
], function(
  gmaps,
  ko,
  utils,
  BaseViewModel
) {
  "use strict";

  ko.bindingHandlers.gmap = {
    init: function(element, valueAccessor) {
      var gmapVm = valueAccessor();
      gmapVm.onBound(element);

      // get notified when the element is disposed
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        var gmapVm = valueAccessor();
        gmapVm.unBound(element);
      });
    },
  };

  function GmapViewModel(options) {
    var _this = this;
    GmapViewModel.super_.call(_this, options);
    //  utils.assertProps(_this, [
    //  	"columns"
    // ]);

    _this.gmapOptions = _this.gmapOptions || {
      center: { // Payson, UT
        lat: 40.0389,
        lng: -111.7331
      },
      zoom: 14,
      styles: window.mapStyle,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
    };

    // _this.active = ko.observable(false);
  }
  utils.inherits(GmapViewModel, BaseViewModel);
  GmapViewModel.ensureProps = BaseViewModel.ensureProps;
  GmapViewModel.prototype.dataView = null;

  GmapViewModel.prototype.onBound = function(element) {
    // create a new gmap everytime this view model is bound/rebound
    var _this = this;
    if (_this.gmap) {
      console.warn("gmap is already bound");
      _this.unBound();
    }
    _this.bindTimeoutId = window.setTimeout(function() {
      _this.bindTimeoutId = 0;
      console.log("google.map bound", window.google.maps);
      _this.gmap = new gmaps.Map(element, _this.gmapOptions);

      var subs = _this._subscribers;
      _this._subscribers = null;
      if (subs) {
        subs.forEach(function(obj) {
          addListener(_this.gmap, obj);
        });
      }
    }, 9);
  };
  GmapViewModel.prototype.unBound = function( /*element*/ ) {
    console.warn("unbinding gmaps is a bad idea");
    // destroy gmap everytime this view model is unbound
    var _this = this;

    // make sure we do not bind
    window.clearTimeout(_this.bindTimeoutId);
    _this.bindTimeoutId = 0;

    if (_this.gmap) {
      // var container = _this.gmap.getContainerNode();
      // if (element && element !== container) {
      //   console.warn("unBound element does not match gmap container", container, element);
      // }
      _this.gmap = null;
    }
  };


  GmapViewModel.prototype.on = function(evtName, cb) {
    var _this = this;
    var obj = {
      evt: evtName,
      cb: cb,
    };
    if (_this.gmap) {
      addListener(_this.gmap, obj);
    } else {
      (_this._subscribers = _this._subscribers || []).push(obj);
    }
  };

  function addListener(map, obj) {
    gmaps.event.addListener(map, obj.evt, obj.cb);
  }

  return GmapViewModel;
});
