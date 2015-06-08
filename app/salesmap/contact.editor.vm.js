define("src/salesmap/contact.editor.vm", [
  "src/salesmap/maphelper",
  "dataservice",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  maphelper,
  dataservice,
  ko,
  ukov,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var intConverter = ukov.converters.number(0);
  var schema = {
    _model: true,

    // Contact
    ID: {
      converter: intConverter,
    },
    Latitude: {},
    Longitude: {},

    // Notes
    FirstName: {},
    LastName: {},
    Note: {},
    CategoryId: {
      converter: intConverter,
    },
    SystemId: {
      converter: intConverter,
    },
    // salesRepLatitude: lat,
    // salesRepLongitude: lng,

    // Address
    Address: {},
    // Address2: {},
    City: {},
    State: {},
    Zip: {},

    // Followup
    FollowupOn: {
      converter: ukov.converters.datetime("Invalid date and time for follow up"),
    },
  };

  function ContactEditorViewModel(options) {
    var _this = this;
    ContactEditorViewModel.super_.call(_this, options);

    _this.data = ukov.wrap(_this.item || {}, schema);
    _this.fullAddress = ko.computed(function() {
      var d = _this.data;
      return strings.joinTrimmed(", ", [
        d.Address(),
        d.City(),
        d.State() + " " + d.Zip(),
        "USA",
      ]);
    });

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    // Save a new contact
    _this.cmdSave = ko.command(function(cb) {
      saveContact(_this, function( /*val*/ ) {
        // val = val.results; // id
        _this.layerResult = _this._saved_model;
        closeLayer(_this);
      }, cb);
    });
    _this.cmdEditCategories = ko.command(function(cb) {
      cb();
    });
  }
  utils.inherits(ContactEditorViewModel, BaseViewModel);
  // ContactEditorViewModel.prototype.viewTmpl = "tmpl-salesmap-contact_editor";
  // ContactEditorViewModel.prototype.width = 800;
  // ContactEditorViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  ContactEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  ContactEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };

  function saveContact(_this, setter, cb) {
    if (!_this.data.isValid.peek()) {
      notify.warn(_this.data.errMsg.peek(), null, 5);
      return cb();
    }
    maphelper.getCoords(function(coords) {
      var model = _this._saved_model = _this.data.getValue();
      //
      model.ID = model.ID || 0;
      model.CategoryId = model.CategoryId || 0;
      model.SystemId = model.SystemId || 0;
      // used for tracking
      model.SalesRepLatitude = (coords) ? coords.lat : null;
      model.SalesRepLongitude = (coords) ? coords.lng : null;
      dataservice.api_sales.contacts.save({
        // id: model.ID || "", // update if there is an id
        data: model,
      }, setter, cb);
    });
  }

  return ContactEditorViewModel;
});
