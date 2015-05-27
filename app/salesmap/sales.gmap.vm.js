define("src/salesmap/sales.gmap.vm", [
  "ko",
  "src/core/utils",
  "src/salesmap/gmap.vm",
], function(
  ko,
  utils,
  GmapViewModel
) {
  "use strict";

  function SalesGmapViewModel(options) {
    var _this = this;
    SalesGmapViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "listeners"
    ]);

    _this.mapMode = ko.observable();

    function bindEvent(name) {
      _this.on(name, function(evt) {
        var mode = _this.mapMode.peek();
        _this.listeners.forEach(function(listener) {
          listener.handleMapEvent(mode, name, evt, evt.latLng);
        });
        // switch ($scope.mapMode) {
        //   case "areas":
        //     SalesArea.handleMapEvent(mode, name, evt, evt.latLng);
        //     break;
        //   case "knocking":
        //     SalesContact.handleMapEvent(mode, name, evt, evt.latLng);
        //     break;
        //     // default:
        //     //   break;
        // }
      });
    }
    bindEvent("click"); //handleClick(evt, evt.latLng);
    bindEvent("dblclick"); //handleDoubleClick(evt, evt.latLng);
    bindEvent("mousemove"); //handleMouseMove(evt, evt.latLng);
    bindEvent("idle");
    bindEvent("drag");

    // _this.on("click", function(evt) {
    //     case "areas":
    //       break;
    //     case "knocking":
    //       SalesContact.handleClick(evt, evt.latLng);
    //       break;
    // _this.on("dblclick", function(evt) {
    //     case "areas":
    //       SalesArea.handleDoubleClick(evt, evt.latLng);
    //       break;
    //     case "knocking":
    //       break;
    // _this.on("mousemove", function(evt) {
    //     case "areas":
    //       SalesArea.handleMouseMove(evt, evt.latLng);
    //       break;
    //     case "knocking":
    //       break;
    // _this.on("idle", function(evt) {
    //   switch ($scope.mapMode) {
    //     case "areas":
    //       break;
    //     case "knocking":
    //       SalesContact.loadVisibleContacts($scope);
    //       SalesArea.loadVisibleAreas($scope);
    //       break;
    //     default:
    //       //$scope.loadVisibleContacts();
    //       break;
    //   }
    //   SalesArea.handleDrag(evt);
    // });
    // _this.on("drag", function(evt) {
    //   SalesArea.handleDrag(evt);
    // });
  }
  utils.inherits(SalesGmapViewModel, GmapViewModel);

  SalesGmapViewModel.prototype.setMapMode = function(mode) {
    var _this = this;
    _this.mapMode = mode;
    var SalesArea;
    switch (_this.mapMode) {
      case "areas":
        SalesArea.setSalesAreaMode(_this, "select");
        break;
      default:
        // case "knocking":
        _this.map.setOptions({
          draggableCursor: null
        });
        break;
    }
    _this.hideTools();
  };

  return SalesGmapViewModel;
});
