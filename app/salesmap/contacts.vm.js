define("src/salesmap/contacts.vm", [
  "$http",
  "$timeout",
  "$compile",
  "Messaging",
  "Site",

  "src/salesmap/maphelper",
  "ko",
  "src/sales/dataservice",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  // $http,
  $timeout,
  $compile,
  $msg,
  $site,
  google,

  maphelper,
  ko,
  dataservice,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  // The SalesContact class
  function SalesContact() {
    this.id = 0;
    this.categoryId = "0";
    this.currentSystemId = "0";
    this.firstName = "";
    this.lastName = "";
    this.address = "";
    this.city = "";
    this.state = "";
    this.zip = "";
    this.fullAddress = "";
    this.notes = "";
    this.followup = undefined;
    this.lat = "";
    this.lng = "";
    this.marker = undefined;
    this.salesRepId = "0";

    this.resetCategoryId = function() {
      this.categoryId = "0";
    };
    this.clone = function() {
      var sc = new SalesContact();
      for (var prop in this) {
        sc[prop] = this[prop];
      }
      return sc;
    };
  }

  function SalesCategory() {
    this.id = "";
    this.icon = "";
    this.name = "New category";
  }

  function ContactsViewModel(options) {
    var _this = this;
    ContactsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
    ]);

    // // method to instantiate a SalesContact object
    // this.SalesContact = SalesContact;

    // whether or not the new contact form is being displayed to the user
    this.newContactFormIsDisplayed = false;

    // the list of contacts currently presented on the screen
    this.contacts = [];
    this.newContact = new SalesContact();
    this.selectedContact = null;
    this.newCategory = new SalesCategory();
    this.selectNewCategory = function(filename) {
      this.newCategory.filename = filename;
      this.newCategory.icon = {
        url: window.IMG_PATH + "map/markers/categories/" + this.newCategory.filename,
        scaledSize: new google.maps.Size(24, 24),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(12, 12),
      };
    };

    // a reusable infowindow to be displayed when a marker is clicked
    this.infowindow = new google.maps.InfoWindow({
      content: "",
    });
    var infowindowContent = "";
    // // load the infowindow template
    // $http.get(window.SITE_PATH + "view/templates/infowindow.html")
    //   .success(function(data) {
    //     infowindowContent = data;
    //   }).error(function( /*data*/ ) {
    //     console.log("Couldn't load InfoWindow template");
    //   });
    var compiledInfoWindowContent;

    var self = this;

    // Handle clicks on the map
    this.handleClick = function($scope, event, latLng) {
      if ( /*!this.newContact || */ this.newContact.marker == null) {
        placeMarker(_this, latLng);
      } else {
        moveMarker(_this, latLng);
      }
    };

    function addInfoBox($scope, ct) {
      if (!compiledInfoWindowContent) {
        compiledInfoWindowContent = $compile(infowindowContent)($scope);
      }

      google.maps.event.addListener(ct.marker, "click", function() {
        self.selectedContact = ct;
        $scope.$apply();

        self.infowindow.setContent(compiledInfoWindowContent[0]);
        self.infowindow.open($scope.map, ct.marker);
      });
    }

    // edit a contact
    _this.cmdEditSelectedContact = ko.command(function( /*$scope*/ ) {
      this.newContact = this.selectedContact;
      this.newContact.backup = this.selectedContact.clone();
      this.newContact.notes = ""; // blank out the notes

      this.infowindow.close();
      this.selectedContact = undefined;
      this.newContactFormIsDisplayed = true;
    });

    // Loads all of the company's contacts within the bounds of the current map
    this.loadVisibleContacts = function($scope) {
      var zm = $scope.map.getZoom();
      if (zm >= 15) {
        // get bounds of map
        var bounds = $scope.map.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        var self = this;

        // check permissions and request the right amount of data.
        // Don't get excited, hackers, the server double checks your authorization
        var sr_id = $site.user.userId;
        var o_id = $site.user.officeId;
        if ($site.hasPermission(["OFFICE_STATS", "COMPANY_STATS"])) {
          sr_id = 0;
        }
        if ($site.hasPermission(["COMPANY_STATS"])) {
          o_id = 0;
        }

        // load from server
        console.log("get_contacts_in_area");
        dataservice.api_sales.contacts.read({
          query: {
            salesRepId: sr_id,
            officeId: o_id,
            minlat: sw.lat(),
            maxlat: ne.lat(),
            minlng: sw.lng(),
            maxlng: ne.lng(),
          },
        }, function(data) {
          if (!data.success && data.require_signin) {
            $site.displaySignInDialog(function() {
              self.loadVisibleContacts($scope);
            });
            return;
          }

          if (data.results) {
            //console.log(data.results);
            var i, j, is_found;

            // iterate through self.contacts and remove any that aren't in data.results
            for (i = 0; i < self.contacts.length; i++) {
              is_found = false;
              for (j = 0; j < data.results.length; j++) {
                if (self.contacts[i].id === data.results[j].id) {
                  is_found = true;
                  break;
                }
              }
              if (!is_found) {
                if (self.contacts[i].marker) {
                  self.contacts[i].marker.setMap(null);
                }
                self.contacts.splice(i, 1);
              }
            }

            // iterate through data.results and add to the map any that aren't in self.contacts
            for (j = 0; j < data.results.length; j++) {
              is_found = false;
              for (i = 0; i < self.contacts.length; i++) {
                if (self.contacts[i].id === data.results[j].id) {
                  is_found = true;
                  break;
                }
              }
              if (!is_found) {
                // add to map
                var ct = new SalesContact();
                ct.id = data.results[j].id;
                ct.categoryId = data.results[j].categoryId;
                ct.currentSystemId = data.results[j].systemId;
                ct.firstName = data.results[j].firstName;
                ct.lastName = data.results[j].lastName;
                ct.latitude = data.results[j].latitude;
                ct.longitude = data.results[j].longitude;
                ct.notes = data.results[j].note;
                ct.salesRepId = data.results[j].salesRepId;
                ct.address = data.results[j].address;
                ct.address2 = data.results[j].address2 || "";
                ct.city = data.results[j].city;
                ct.state = data.results[j].state;
                ct.zip = data.results[j].zip;
                ct.fullAddress = data.results[j].fullAddress;
                var location = new google.maps.LatLng(ct.latitude, ct.longitude);
                var theicon = window.genericContactIcon;
                if ($scope.iconmode === "category") {
                  var cat = $scope.getCategoryById(ct.categoryId);
                  if (cat) {
                    theicon = cat.icon;
                  }
                } else {
                  var systype = $scope.getSystemById(ct.currentSystemId);
                  if (systype) {
                    theicon = systype.icon;
                  }
                }
                ct.marker = new google.maps.Marker({
                  position: location,
                  map: $scope.map,
                  icon: theicon,
                  zIndex: 97,
                });
                addInfoBox($scope, ct);
                self.contacts.push(ct);
              }
            }
          }
          self.filterVisibleContacts($scope);
        });
      } else {
        for (var i = 0; i < this.contacts.length; i++) {
          if (this.contacts[i].marker) {
            this.contacts[i].marker.setMap(null);
          }
        }
        this.contacts = [];
      }
    };

    this.filterVisibleContacts = function($scope) {
      for (var i = 0; i < this.contacts.length; i++) {
        if (this.contacts[i].marker) {
          var display = true;

          // filter out if the wrong office is checked
          var rep = $scope.getSalesRepById(this.contacts[i].salesRepId);
          if (!(rep && rep.officeId === $scope.officeId) && $scope.officeId !== 0) {
            display = false;
          }

          // filter out if the wrong sales rep is checked
          if (this.contacts[i].salesRepId !== $scope.salesRepId && $scope.salesRepId !== 0) {
            display = false;
          }

          // filter out if the category or systemType is unchecked
          var ct = $scope.getCategoryById(this.contacts[i].categoryId);
          if (!ct || !ct.visible) {
            display = false;
          }

          var st = $scope.getSystemById(this.contacts[i].currentSystemId);
          if (!st || !st.visible) {
            display = false;
          }

          this.contacts[i].marker.setMap((display) ? $scope.map : null);
        }
      }
    };

    this.updateIcons = function($scope) {
      var theicon = window.genericContactIcon;
      if (this.contacts) {
        for (var i = 0; i < this.contacts.length; i++) {
          if ($scope.iconmode === "category") {
            var cotype = $scope.getCategoryById(this.contacts[i].categoryId);
            if (cotype) {
              theicon = cotype.icon;
            }
          } else {
            var systype = $scope.getSystemById(this.contacts[i].currentSystemId);
            if (systype) {
              theicon = systype.icon;
            }
          }

          this.contacts[i].marker.setIcon(theicon);
        }
      }
    };

    var $scope = "?????????????";

    // Deletes a category for the current user
    _this.cmdDeleteCategory = ko.command(function(cb, $scope, category) {
      dataservice.api_sales.categories.del(category.id, function() {
        notify.info("Category " + category.name + " deleted.", null, 2);

        // remove the category from all lists
        for (var i = 0; i < $scope.categories.length; i++) {
          if ($scope.categories[i].id === category.id) {
            $scope.categories.splice(i, 1);
          }
        }

        // update any markers with this category to have a generic one instead
        for (i = 0; i < self.contacts.length; i++) {
          if (self.contacts[i].categoryId === category.id) {
            if (self.contacts[i].marker) {
              self.contacts[i].marker.setIcon(window.genericContactIcon);
            }
          }
        }
      }, cb);
    });
    //
    _this.cmdSaveCategory = ko.command(function(cb) {
      saveCategory(_this, function(val) {
        val.visible = true;
        val.icon = {
          url: window.IMG_PATH + "map/markers/categories/" + val.filename,
          scaledSize: new google.maps.Size(24, 24),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(12, 12),
        };
        // close the dialog box
        $scope.hideNewCategoryDialog();

        var inserted, i;
        if (_this.newCategory.id) {
          inserted = false;
          $scope.displayEditCategoriesDialog();
          for (i = 0; i < $scope.categories.length; i++) {
            if ($scope.categories[i].id === _this.newCategory.id) {
              $scope.categories.splice(i, 1, _this.newCategory);
              inserted = true;
            }
          }
          if (!inserted) {
            $scope.categories.push(_this.newCategory);
          }

          // if iconmode == category
          if ($scope.iconmode === "category") {
            // iterate through all contacts on the map and change the marker for any of them that have this category id
            for (i = 0; i < _this.contacts.length; i++) {
              if (_this.contacts[i].categoryId === _this.newCategory.id) {
                if (_this.contacts[i].marker) {
                  _this.contacts[i].marker.setIcon(_this.newCategory.icon);
                }
              }
            }
          }
        } else {
          // push the new category onto the categories array (try to alphabetize)
          inserted = false;
          for (i = 0; i < $scope.categories.length; i++) {
            if ($scope.categories[i].name.localeCompare(val.name) > 0) {
              $scope.categories.splice(i, 0, val);
              inserted = true;
              break;
            }
          }
          if (!inserted) {
            $scope.categories.push(val);
          }

          // select it
          $timeout(function() {
            _this.newContact.categoryId = String(val.id);
            $scope.categoryChanged();
          }, 5);
        }
      }, cb);
    });
  }
  utils.inherits(ContactsViewModel, ControllerViewModel);
  // ContactsViewModel.prototype.viewTmpl = "tmpl-salesmap-contacts";

  function saveCategory(_this, setter, cb) {
    dataservice.api_sales.categories.save({
      id: _this.newCategory.id,
      name: _this.newCategory.name,
      filename: _this.newCategory.filename,
    }, setter, cb);
  }


  // Places a marker on the map so the user can input a new contact
  function placeMarker(_this, location) {
    //_this.newContact = new SalesContact();
    _this.newContact.lat = location.lat();
    _this.newContact.lng = location.lng();
    console.log(_this.newContact);

    _this.newContact.marker = new google.maps.Marker({
      position: location,
      map: _this.gmapVm.map,
      icon: window.newContactIcon,
      zIndex: 99,
    });
    // addInfoBox($scope, _this.newContact);

    reverseGeocode(_this, location);

    // $scope.$apply(function() {
    _this.newContactFormIsDisplayed = true;
    // });
  }
  // Moves the current contact marker to a new location
  function moveMarker(_this, location) {
    _this.newContact.marker.setPosition(location);
    reverseGeocode(_this, location);
  }

  function reverseGeocode(_this, location) {
    var contactVm = _this.contactVm.peek();
    maphelper.reverseGeocode(location, function(errMsg, result) {
      if (errMsg) {
        notify.warn(errMsg, null, 2);
        return;
      }
      // ensure the contact hasn't changed
      if (contactVm !== _this.contactVm.peek()) {
        return;
      }

      // $scope.$apply(function() {
      SalesContact.newContact.fullAddress = result.formatted_address;

      var street_number = "";
      var street = "";
      for (var i = 0; i < result.address_components.length; i++) {
        var comp = result.address_components[i];
        if (comp.types.length) {
          switch (comp.types[0]) {
            case "locality":
              SalesContact.newContact.city = comp.long_name;
              break;
            case "postal_code":
              SalesContact.newContact.zip = comp.long_name;
              break;
            case "administrative_area_level_1":
              SalesContact.newContact.state = comp.short_name;
              break;
            case "street_number":
              street_number = comp.long_name;
              break;
            case "route":
              street = comp.short_name;
              break;
          }
        }
      }
      // combine street number and street to get address
      SalesContact.newContact.address = street_number + " " + street;
    });
  }

  return ContactsViewModel;
});
