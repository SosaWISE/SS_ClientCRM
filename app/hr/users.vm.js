define('src/hr/users.vm', [
  'src/hr/user.vm',
  'src/hr/usersearch.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  UserViewModel,
  UserSearchViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  var userid = -1;

  function UsersViewModel(options) {
    var _this = this;
    UsersViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.list = _this.childs;

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm);
    };
    _this.clickNew = function() {
      var vm = createUserViewModel(_this, userid--);
      _this.list.push(vm);
      _this.selectChild(vm);
    };
  }
  utils.inherits(UsersViewModel, ControllerViewModel);
  UsersViewModel.prototype.viewTmpl = 'tmpl-hr-users';

  UsersViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;
    _this.searchVm = new UserSearchViewModel({
      pcontroller: _this,
      id: 'search',
      title: 'Search',
    });
    _this.defaultChild = _this.searchVm;

    _this.cache = {};
    _this.cache.shirtSizeOptions = _this.shirtSizeOptions;
    _this.cache.hatSizeOptions = _this.hatSizeOptions;
    _this.cache.sexOptions = _this.sexOptions;
    _this.cache.maritalStatusOptions = _this.maritalStatusOptions;
    //
    //@TODO: get the below options from the web api
    //
    _this.cache.userEmployeeOptions = _this.userEmployeeOptions;
    _this.cache.phoneCellCarrierOptions = _this.phoneCellCarrierOptions;
  };

  UsersViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result, id;
    if (routeData[_this.searchVm.routePart] === _this.searchVm.id) {
      result = _this.searchVm;
    } else {
      result = UsersViewModel.super_.prototype.findChild.call(_this, routeData);
      if (!result) {
        // get child id
        id = routeData[_this.getChildRoutePart(routeData.route)];
        if (id > 0) {
          // add child
          result = createUserViewModel(_this, id);
          _this.list.push(result);
        }
      }
    }
    return result;
  };

  function createUserViewModel(_this, id) {
    return new UserViewModel({
      pcontroller: _this,
      id: id,
      cache: _this.cache,
      layersVm: _this.layersVm,
    });
  }


  UsersViewModel.prototype.shirtSizeOptions = [ //
    {
      value: 1,
      text: 'XXS'
    }, {
      value: 2,
      text: 'XS'
    }, {
      value: 3,
      text: 'S'
    }, {
      value: 4,
      text: 'M'
    }, {
      value: 5,
      text: 'L'
    }, {
      value: 6,
      text: 'XL'
    }, {
      value: 7,
      text: 'XXL'
    }, {
      value: 8,
      text: 'XXXL'
    },
  ];
  UsersViewModel.prototype.hatSizeOptions = [ //
    {
      value: 1,
      text: 'S'
    }, {
      value: 2,
      text: 'M'
    }, {
      value: 3,
      text: 'L'
    },
  ];
  UsersViewModel.prototype.sexOptions = [ //
    {
      value: 1,
      text: 'Male'
    }, {
      value: 2,
      text: 'Female'
    },
  ];
  UsersViewModel.prototype.maritalStatusOptions = [ //
    {
      value: false,
      text: 'Single'
    }, {
      value: true,
      text: 'Married'
    },
  ];

  //
  //@TODO: get the below options from the web api
  //
  UsersViewModel.prototype.userEmployeeOptions = [ //
    {
      value: 'CONT',
      text: ' Contractor',
    }, {
      value: 'CORP',
      text: ' Corporate',
    }, {
      value: 'DEFAULT',
      text: 'Default',
    }, {
      value: 'SALESREP',
      text: 'Sales Rep',
    }, {
      value: 'SUBCONT',
      text: 'Sub Contractor',
    }, {
      value: 'TECHNCN',
      text: 'Technician',
    }, {
      value: 'VENDOR',
      text: 'Vendor',
    },
  ];
  UsersViewModel.prototype.phoneCellCarrierOptions = [ //
    {
      value: 1,
      text: 'Verizon'
    }, {
      value: 2,
      text: 'TMobile'
    }, {
      value: 3,
      text: 'Sprint'
    }, {
      value: 4,
      text: 'CricKet'
    }, {
      value: 5,
      text: 'Cingular AT&T'
    }, {
      value: 6,
      text: 'NEXTEL'
    }, {
      value: 7,
      text: 'Unknown'
    }, {
      value: 8,
      text: 'amp\'d'
    }, {
      value: 9,
      text: 'Virgin mobile'
    }, {
      value: 10,
      text: 'Beyond GSM'
    }, {
      value: 11,
      text: 'boost mobile'
    }, {
      value: 12,
      text: 'Tracfone'
    }, {
      value: 13,
      text: 'Airvoice'
    }, {
      value: 14,
      text: 'Alltel'
    }, {
      value: 15,
      text: 'Qwest'
    }, {
      value: 16,
      text: 'metroPCS'
    }, {
      value: 17,
      text: 'Bell'
    }, {
      value: 18,
      text: 'Telus'
    }, {
      value: 19,
      text: 'Rogers'
    }, {
      value: 20,
      text: 'Fido'
    }, {
      value: 21,
      text: 'Edge'
    }, {
      value: 22,
      text: 'US Cellular'
    }, {
      value: 23,
      text: 'Cellular South'
    }, {
      value: 24,
      text: 'Centennial'
    }, {
      value: 25,
      text: 'Cingular'
    }, {
      value: 26,
      text: 'SunCom'
    }, {
      value: 27,
      text: 'US Cellular'
    },
  ];

  return UsersViewModel;
});
