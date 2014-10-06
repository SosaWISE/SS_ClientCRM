define('src/hr/users.vm', [
  'src/dataservice',
  'src/hr/user.vm',
  'src/hr/usersearch.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  UserViewModel,
  UserSearchViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  var userid = -1,
    usersCache = {};

  function UsersViewModel(options) {
    var _this = this;
    UsersViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.searchVm = ko.observable();
    _this.list = _this.childs;

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm.peek());
    };
    _this.clickNew = function() {
      var vm = createUserViewModel(_this, userid--);
      _this.list.push(vm);
      _this.selectChild(vm);
    };
  }
  utils.inherits(UsersViewModel, ControllerViewModel);
  UsersViewModel.prototype.viewTmpl = 'tmpl-hr-users';

  UsersViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.cache = {};
    _this.cache.shirtSizes = usersCache.shirtSizes;
    _this.cache.hatSizes = usersCache.hatSizes;
    _this.cache.sexs = usersCache.sexs;
    _this.cache.maritalStatuss = usersCache.maritalStatuss;
    //
    dataservice.humanresourcesrv.userEmployeeTypes.read({}, function(val) {
      _this.cache.userEmployeeTypes = val;
    }, join.add());
    dataservice.humanresourcesrv.phoneCellCarriers.read({}, function(val) {
      _this.cache.phoneCellCarriers = val;
    }, join.add());
    dataservice.humanresourcesrv.seasons.read({}, function(val) {
      _this.cache.seasons = val;
    }, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      var vm = new UserSearchViewModel({
        pcontroller: _this,
        id: 'search',
        title: 'Search',
        cache: _this.cache,
      });
      _this.defaultChild = vm;
      _this.searchVm(vm);
    });
  };

  UsersViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      searchVm, result, id;
    searchVm = _this.searchVm.peek();
    if (searchVm && routeData[searchVm.routePart] === searchVm.id) {
      result = searchVm;
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

  usersCache.shirtSizes = [ //
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
  usersCache.hatSizes = [ //
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
  usersCache.sexs = [ //
    {
      value: 1,
      text: 'Male'
    }, {
      value: 2,
      text: 'Female'
    },
  ];
  usersCache.maritalStatuss = [ //
    {
      value: false,
      text: 'Single'
    }, {
      value: true,
      text: 'Married'
    },
  ];

  return UsersViewModel;
});
