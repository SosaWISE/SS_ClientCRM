define('src/panels/swing.panel.vm', [
  'src/account/default/address.validate.vm',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/joiner',
  'src/core/jsonhelpers',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
  'src/dataservice',
  'src/core/router',
  'src/slick/slickgrid.vm',
  'src/config',
  'src/slick/rowevent',
  'src/ukov',
], function(
  AddressValidateViewModel,
  ComboViewModel,
  notify,
  joiner,
  jsonhelpers,
  ko,
  utils,
  ControllerViewModel,
  dataservice,
  router,
  SlickGridViewModel,
  config,
  RowEvent,
  ukov
) {
  "use strict";
  var schema, customerSchema, addressSchema, systemDetailSchema;
  // nullStrConverter = ukov.converters.nullString();


  //we need nested customer objects inorder easier display of the 2 customer information
  customerSchema = {
    _model: true,
    Prefix: {},
    FirstName: {},
    MiddleName: {},
    LastName: {},
    Suffix: {},
    SSN: {},
    DOB: {},
    Email: {},
  };

  addressSchema = {
    _model: true,
    StreetAddress1: {},
    StreetAddress2: {},
    City: {},
    County: {},
    PostalCode: {},
    State: {},
  };

  systemDetailSchema = {
    _model: true,
    ServiceType: {},
    CellularType: {},
    PassPhrase: {},
    PanelType: {},
    DslSeizure: {},
  };


  schema = {
    _model: true,
    AccountID: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('Account ID is required')
      ]
    },
    Customer1: customerSchema,
    Customer2: customerSchema,
    Address: addressSchema,
    SystemDetail: systemDetailSchema,
    SwingEquipment: {},
    InterimAccountId: {},
    CustomerMasterFileID: {},
    PhoneNumber: {
      converter: ukov.converters.phone()
    },
  };


  function SwingViewModel(options) {
    var _this = this;

    SwingViewModel.super_.call(_this, options);

    _this.title = 'Swing Accounts';

    //Validate inputs
    _this.data = ukov.wrap({}, schema);

    // console.log(_this.data);

    //initialize hide the AccountID label
    _this.isVisible = ko.observable(false);

    //Emergency Contact List
    _this.swingEmGvm = new SlickGridViewModel({
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [{
        id: 'Name',
        name: 'Name',
        formatter: function(row, cell, value, columnDef, dataCtx) {
          var name;
          // name concatenations goes here
          name = dataCtx.MiddleInit == null ? dataCtx.FirstName + " " + dataCtx.LastName : dataCtx.FirstName + " " + dataCtx.MiddleInit + " " + dataCtx.LastName;
          return name;
        },
      }, {
        id: 'Relationship',
        name: 'Relationship',
        field: 'Relationship',
      }, {
        id: 'Phone',
        name: 'Phone',
        field: 'PhoneNumber1',
      }, ],
    });


    //Equipment Details list
    _this.swingEquipmentGvm = new SlickGridViewModel({
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [{
        id: 'Zone',
        name: 'Zone',
        field: 'ZoneTypeName',
      }, {
        id: 'Equipment',
        name: 'Equipment',
        field: 'FullName',
      }, {
        id: 'Location',
        name: 'Location',
        field: 'EquipmentLocationDesc',
      }, ],
    });

    //events
    //
    _this.cmdSearch = ko.command(function(cb, vm) {
      _this.search(vm, cb);
    });

    //Swing button event
    _this.cmdSwing = ko.command(function(cb, vm) {
      _this.swing(vm, cb);
    });

    //Add to DNC list
    _this.cmdAddDnc = ko.command(function(cb, vm) {
      _this.addDnc(vm, cb);
    });


  }

  utils.inherits(SwingViewModel, ControllerViewModel);

  //
  // members
  //

  SwingViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    this.swingEmGvm.list([]);
    this.swingEquipmentGvm.list([]);

    join = join;
  };
  SwingViewModel.prototype.onActivate = function(routeData) {

    routeData.action = 'swing';
  };


  SwingViewModel.prototype.clearData = function() {
    var _this = this,
      data,
      customer = {
        Prefix: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        Suffix: "",
        SSN: "",
        DOB: "",
        Email: ""
      },
      address = {
        StreetAddress1: "",
        StreetAddress2: "",
        City: "",
        County: "",
        PostalCode: "",
        State: "",
      },
      systemDetail = {
        ServiceType: "",
        CellularType: "",
        PassPhrase: "",
        PanelType: "",
        DslSeizure: "",
      };

    //Clear fields
    data = {
      //AccountID: null,
      Customer1: customer,
      Customer2: customer,
      Address: address,
      SystemDetail: systemDetail,
      SwingEquipment: null,
      PhoneNumber: null
    };

    _this.data.setValue(data);
    _this.swingEmGvm.list([]);
    _this.swingEquipmentGvm.list([]);

    _this.isVisible(false);

  };

  SwingViewModel.prototype.search = function(vm, cb) {
    //account object to be searched in ms_account table (accessed via stored procedure) from old database
    var msAccountSearch = vm.data.getValue(),
      customer1, _this = this,

      //add joiner since we need to call cb when all api calls have returned
      join = joiner();

    //clear previous result
    _this.clearData();

    //load info for the primary customer
    load_customer_swing_info(vm, {
      InterimAccountId: msAccountSearch.AccountID,
      CustomerType: "PRI"
    }, join.add());

    join.when(function( /*err*/ ) {
      /*if (err) {
          notify.notify('warn', "Account ID not found", null, 10);
        }else{
          console.log("no error");
        }*/
      customer1 = vm.data.Customer1.getValue();
      //check if customer1 first name is available it means -- account id is available in the old db
      //also we were able to minimize API calls
      if (customer1.FirstName === "") {
        notify.notify('warn', "Account ID not found", null, 10);
      } else {
        //we only call the following APIs once Account
        //load info for the secondary customer
        load_customer_swing_info(vm, {
            InterimAccountId: msAccountSearch.AccountID,
            CustomerType: "SEC"
          },
          join.add());

        //load info for the account details
        load_msaccount_details(vm,
          msAccountSearch, join.add());
      }

      //since we are using joiner. invoked cb only once
      cb();
    });


  };


  //This will call an api to execute the swing process
  SwingViewModel.prototype.swing = function(vm, cb) {

    var msAccountSearch = vm.data.getValue();

    console.log('vm data value:' + JSON.stringify(msAccountSearch));
    console.log('Swing Equipment value: ' + msAccountSearch.SwingEquipment);

    dataservice.swingaccountsrv.CustomerSwingInterim.post(null, {
      InterimAccountId: msAccountSearch.AccountID,
      SwingEquipment: msAccountSearch.SwingEquipment
    }, null, utils.safeCallback(null, function(err, resp) {

      //debugging
      console.log('Value:' + JSON.stringify(resp.Value));

      if (err) {
        notify.notify('error', 'Error', err.Message, 10);
      } else if (resp.Value) {
        //if (resp.Value.SwingStatus === "1") {

        //disable swing button and display label New Accounted created
        vm.isVisible(true);
        vm.data.InterimAccountId(resp.Value.MsAccountID);
        vm.data.CustomerMasterFileID(resp.Value.CustomerMasterFileID);

        notify.notify('ok', 'Swing Successful!');

        //} else {

        //temporarily display exception error from database. can't figure out how to return the exception returned by c# yet
        //notify.notify('error', 'Error', resp.Value.SwingStatus);
        //}
      } else {
        //vm.data.setVal(null);
        vm.data.markClean(resp.Value, true);
        notify.notify('warn', 'Account ID not found', null, 7);
        vm.clearData();
      }

      //}, utils.no_op));
    }, function(err) {
      notify.notify('error', err.Message);
    }));

    cb();
  };

  //customer swing info
  function load_customer_swing_info(vm, swingParam, cb) {
    //load data on UI for customer 1
    if (swingParam.CustomerType === "PRI") {
      dataservice.swingaccountsrv.CustomerSwingInfo.post(null, swingParam, null, utils.safeCallback(cb, function(err, resp) {

        if (err) {
          cb(err);
          // notify.notify('error', 'Error', err.Message, 10);
          // console.log("error in load_customer_swing_info");
          return;
        }
        if (resp.Value) {

          //console.log(resp.Code);
          if (resp.Code === 0) {
            var customer = resp.Value;

            //before inserting to ui, parse it first using jsonhelpers.parse
            customer = jsonhelpers.parse(jsonhelpers.stringify(customer));

            vm.data.Customer1.setValue(customer);
            //console.log("true in load_customer_swing_info");
          } else {
            notify.notify('warn', 'Account ID not found', null, 3);
          }
        } else {
          // console.log("false resp.Value in load_customer_swing_info");
        }
      }, utils.no_op));

    } else {

      //load data on UI for customer 2
      dataservice.swingaccountsrv.CustomerSwingInfo.post(null, swingParam,
        null, utils.safeCallback(cb, function(err, resp) {
          if (err) {
            //cb(error);
            notify.notify('error', 'Error', err.Message, 10);
            //console.log("error in load_customer_swing_info");
            return;
          }
          if (resp.Value) {

            //console.log(resp.Code);
            if (resp.Code === 0) {
              var customer = resp.Value;

              //before inserting to ui, parse it first using jsonhelpers.parse
              customer = jsonhelpers.parse(jsonhelpers.stringify(customer));

              vm.data.Customer2.setValue(customer);
              //console.log("true in load_customer_swing_info");
            } else {
              notify.notify('warn', 'Account ID not found', null, 3);
            }
          } else {
            //console.log("false resp.Value in load_customer_swing_info");
          }
        }, utils.no_op));
    }
  }


  //used to extract msaccount details like customer info, premise address,
  //emergency contacts and Equipment Details and load into the SWING UI
  //msAccount- result from search
  //system details
  function load_msaccount_details(vm, msAccount, cb) {

    //load data on UI for Premise Address
    //alert(msAccount.AccountID);

    dataservice.swingaccountsrv.CustomerSwingPremiseAddress.read({
        id: msAccount.AccountID
      },
      null, utils.safeCallback(cb, function(err, resp) {
        if (err) {
          notify.notify('error', 'Error', err.Message, 10);
          return;
        }

        if (resp.Value) {

          var address = resp.Value;
          //This is an easier way of setting Ukov model properties
          vm.data.Address.setValue(address);
        }

      }, utils.no_op));


    //load data on UI for Emergency Contact
    //SlickGrid columns can have a formatter so for concatenating the full name of an emergency contact
    dataservice.swingaccountsrv.CustomerSwingEmergencyContact.read({
      id: msAccount.AccountID
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (err) {
        notify.notify('error', 'Error', err.Message, 10);
        return;
      }
      if (resp.Value) {

        //Insert the first occurence of phone number to Add Dnc phone number field
        if (resp.Value.length > 0) {
          vm.data.PhoneNumber(resp.Value[0].PhoneNumber1);
        }

        //Update Emergency Contact List
        vm.swingEmGvm.list(resp.Value);
      }
    }, utils.no_op));


    //load data on UI for System Details
    dataservice.swingaccountsrv.CustomerSwingSystemDetails.read({
        id: msAccount.AccountID
      },
      null, utils.safeCallback(cb, function(err, resp) {

        if (err) {
          notify.notify('error', 'Error', err.Message, 10);
          return;
        }
        if (resp.Value) {
          var systemDetail = resp.Value;
          vm.data.SystemDetail.setValue(systemDetail);
        }

      }, utils.no_op));

    //load data on UI for Equipment Info
    dataservice.swingaccountsrv.CustomerSwingEquipmentInfo.read({
      id: msAccount.AccountID
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (err) {
        notify.notify('error', 'Error', err.Message, 10);
        return;
      }
      if (resp.Value) {
        vm.swingEquipmentGvm.list(resp.Value);
      }

    }, utils.no_op));


    //Get Info from Swung table
    dataservice.swingaccountsrv.CustomerSwungInfo.read({
        id: msAccount.AccountID
      },
      null, utils.safeCallback(cb, function(err, resp) {

        if (err) {
          notify.notify('error', 'Error', err.Message, 10);
          return;
        }
        if (resp.Value) {
          //AccountID is found on swung table -  disable swing button and show label [AccountID]
          console.log("Match found.");

          vm.isVisible(true);
          vm.data.InterimAccountId(resp.Value.MsAccountID);
          vm.data.CustomerMasterFileID(resp.Value.CustomerMasterFileID);
        }
      }, utils.no_op));



  } //end of load_msaccount_details function

  //Add to DNC list
  SwingViewModel.prototype.addDnc = function(vm, cb) {

    //Retrieve data from UI
    var dataUI = vm.data.getValue(),
      cPhoneNumber = dataUI.PhoneNumber;

    /** Add additional validation **/

    //Check if Phone Number is null
    if (cPhoneNumber == null) {
      notify.notify('warn', 'Phone Number can\'t be empty.');
      cb();
      //If Phone number is invalid, it will return an object. Not sure how to return specifically the error
    } else if (typeof(cPhoneNumber) === 'object') {
      notify.notify('warn', cPhoneNumber);
      cb();
    } else {

      //If Phone number returns a string, it is valid

      //Remove parenthesis and dash. Copied the parsing from here: http://stackoverflow.com/questions/5407223/javascript-regex-parsing
      cPhoneNumber = cPhoneNumber.replace(/\)\s*|\(\s*|-/g, '');

      console.log("PhoneNumber:" + cPhoneNumber);

      //Call api to add Phone number to DNC list
      dataservice.swingaccountsrv.CustomerSwingAddDnc.read({
          id: cPhoneNumber
        },
        null, utils.safeCallback(cb, function(err, resp) {

          if (err) {
            notify.notify('error', 'Error', err.Message, 10);
            return;
          }
          if (resp.Value) {

            //Debugging display of response value
            console.log(JSON.stringify(resp.Value));

            if (resp.Value.Dnc_Status === "Success") {
              notify.notify('ok', 'Success: Added to DNC list.');
              vm.data.PhoneNumber.setValue(null);
            } else {
              notify.notify('warn', resp.Value.Dnc_Status);
            }


          }
        }, utils.no_op));

      cb();

    } //end else

  }; // adding of DNC list

  return SwingViewModel;
});
