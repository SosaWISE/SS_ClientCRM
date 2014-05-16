define('src/panels/swing.panel.vm', [
    'src/account/default/address.validate.vm',
    'src/core/combo.vm',
    'src/core/notify',
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
    var schema,
        nullStrConverter = ukov.converters.nullString();
    schema = {
        _model: true,

        AccountID: {
            converter: ukov.converters.number(0),
            validators: [
                ukov.validators.isRequired('Account ID is required')
            ]
        },
        PassedCredit: {
            converter: nullStrConverter,
        },
        FullCustomer: {
            converter: nullStrConverter,
        },
        Customer1ID: {
            converter: nullStrConverter,
        },
        Customer2ID: {
            converter: nullStrConverter,
        },
        StateId: {
            converter: nullStrConverter,
        },
        Customer1Prefix: {},
        Customer1FirstName: {},
        Customer1MiddleName: {},
        Customer1LastName: {},
        Customer1Suffix: {},
        Customer1SSN: {},
        Customer1DOB: {
            converter: ukov.converters.date(),
        },
        Customer1Email: {},

        Customer2Prefix: {},
        Customer2FirstName: {},
        Customer2MiddleName: {},
        Customer2LastName: {},
        Customer2Suffix: {},
        Customer2SSN: {},
        Customer2DOB: {
            converter: ukov.converters.date(),
        },
        Customer2Email: {},

        StreetAddress1: {},
        StreetAddress2: {},
        City: {},
        County: {},
        PostalCode: {},
        State: {},

        ServiceType: {},
        CellularType: {},
        PassPhrase: {},
        PanelType: {},
        DslSeizure: {},


        // PhoneNumber: {
        //   converter: ukov.converters.phone(),
        // },
        // City: {
        //   converter: nullStrConverter,
        // },
        // PostalCode: {
        //   converter: nullStrConverter,
        //   validators: [
        //     ukov.validators.isZipCode(),
        //   ],
        // },
        // PageSize: {
        //   converter: ukov.converters.number(0),
        // },
        // PageNumber: {
        //   converter: ukov.converters.number(0),
        // },
    };


    function SwingViewModel(options) {
        var _this = this;


        SwingViewModel.super_.call(_this, options);

        _this.title = 'Swing Accounts';

        //Validate inputs
        _this.data = ukov.wrap({}, schema);

        //_this.focusFirst = ko.observable(false);

        /** Removed - change dropdown to textfield **/
        /*
        _this.data.StateCvm = new ComboViewModel({
            matchStart: true,
            selectedValue: _this.data.StateId,
            list: AddressValidateViewModel.prototype.stateOptions, //@TODO: load states from server
            nullable: true,
        });
        */

        //Emergency Contact List
        _this.swingEmGvm = new SlickGridViewModel({
            gridOptions: {
                enableColumnReorder: false,
                forceFitColumns: true,
                rowHeight: 27,
            },
            // plugins: [
            //   new RowEvent({
            //     eventName: 'onDblClick',
            //     fn: function(acct) {
            //       _this.goTo({
            //         route: 'accounts',
            //         masterid: acct.CustomerMasterAccountID,
            //       });
            //     },
            //   }),
            // ],
            columns: [{
                id: 'Name',
                name: 'Name',
                field: 'Name',
            }, {
                id: 'Relationship',
                name: 'Relationship',
                field: 'Relationship',
            }, {
                id: 'Phone',
                name: 'Phone',
                field: 'Phone',
            }, ],
        });

        /*
    while (_this.swingEmGvm.list().length < 3) {
      _this.swingEmGvm.list().push({
        Name: 'Dummy' + (_this.swingEmGvm.list().length + 1),
        Relationship: 'Dummy' + (_this.swingEmGvm.list().length + 1),
        Phone: 'Dummy' + (_this.swingEmGvm.list().length + 1),
      });
    }
*/

        //Equipment Details list
        _this.swingEquipmentGvm = new SlickGridViewModel({
            gridOptions: {
                enableColumnReorder: false,
                forceFitColumns: true,
                rowHeight: 27,
            },
            // plugins: [
            //   new RowEvent({
            //     eventName: 'onDblClick',
            //     fn: function(acct) {
            //       _this.goTo({
            //         route: 'accounts',
            //         masterid: acct.CustomerMasterAccountID,
            //       });
            //     },
            //   }),
            // ],
            columns: [{
                id: 'Zone',
                name: 'Zone',
                field: 'Zone',
            }, {
                id: 'Equipment',
                name: 'Equipment',
                field: 'Equipment',
            }, {
                id: 'Location',
                name: 'Location',
                field: 'Location',
            }, ],
        });


        /*
    while (_this.swingEquipmentGvm.list().length < 3) {
      _this.swingEquipmentGvm.list().push({
        Name: 'Dummy' + (_this.swingEquipmentGvm.list().length + 1),
        Relationship: 'Dummy' + (_this.swingEquipmentGvm.list().length + 1),
        Phone: 'Dummy' + (_this.swingEquipmentGvm.list().length + 1),
      });
    }
  */

        //
        //events
        //
        _this.cmdSearch = ko.command(function(cb, vm) {
            //alert("search");
            //console.log(vm);
            //this is how we extract data from view/ template???
            //var account = _this.data.getValue();
            //alert(account.AccountID);
            //cb();

            _this.search(vm, cb);



        });

        //Swing button event
        _this.cmdSwing = ko.command(function(cb, vm) {
            _this.swing(vm, cb);
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

        //Clear data grid
        this.swingEmGvm.list([]);
        this.swingEquipmentGvm.list([]);

        //Clear fields
        var _this = this,
            data = {
                AccountID: null,
                PassedCredit: null,
                FullCustomer: null,
                Customer1ID: null,
                Customer2ID: null,
                Customer1Prefix: null,
                Customer1FirstName: null,
                Customer1MiddleName: null,
                Customer1LastName: null,
                Customer1Suffix: null,
                Customer1SSN: null,
                Customer1DOB: null,
                Customer1Email: null,
                Customer2Prefix: null,
                Customer2FirstName: null,
                Customer2MiddleName: null,
                Customer2LastName: null,
                Customer2Suffix: null,
                Customer2SSN: null,
                Customer2DOB: null,
                Customer2Email: null,
                StreetAddress1: null,
                StreetAddress2: null,
                City: null,
                County: null,
                PostalCode: null,
                State: null,
                ServiceType: null,
                CellularType: null,
                PassPhrase: null,
                PanelType: null,
                DslSeizure: null,

            };

        _this.data.setVal(data);
        _this.data.markClean(data, true);
    };

    SwingViewModel.prototype.search = function(vm, cb) {
        //account object to be searched in ms_account table (accessed via stored procedure) from old database
        var msAccountSearch = vm.data.getValue();

        //alert(JSON.stringify(msAccountSearch));
        //alert(msAccountSearch.AccountID);

        //load info for the primary customer
        load_customer_swing_info(vm, {
            InterimAccountId: msAccountSearch.AccountID,
            CustomerType: "PRI"
        });

        //load info for the secondary customer
        load_customer_swing_info(vm, {
            InterimAccountId: msAccountSearch.AccountID,
            CustomerType: "SEC"
        });
        load_msaccount_details(vm, msAccountSearch);

        cb();

    };


    //This will call an api to execute the swing process
    SwingViewModel.prototype.swing = function(vm, cb) {

        var msAccountSearch = vm.data.getValue();

        dataservice.swingaccountsrv.CustomerSwingInterim.post(null, {
            InterimAccountId: msAccountSearch.AccountID
        }, null, utils.safeCallback(null, function(err, resp) {

            if (err) {
                notify.notify('warn', err.Message, 10);
            } else if (resp.Value) {
                if (resp.Value.SwingStatus === "1") {
                    notify.notify('ok', 'Swing Successful!');
                } else {
                    notify.notify('error', 'Swing Failed!');
                }
            } else {
                //vm.data.setVal(null);
                vm.data.markClean(resp.Value, true);
                notify.notify('warn', 'Account ID not found', 7);
                vm.clearData();
            }

        }, utils.no_op));

        cb();
    };


    //customer swing info
    function load_customer_swing_info(vm, swingParam) {

        //load data on UI for customer 1
        if (swingParam.CustomerType === "PRI") {
            dataservice.swingaccountsrv.CustomerSwingInfo.post(null, swingParam, null, utils.safeCallback(null, function(err, resp) {
                if (err) {
                    notify.notify('warn', err.Message, 10);
                    //vm.focusFirst(true);
                } else if (resp.Value) {
                    //we are not sure if this is the correct way of assign value to UI
                    var customer = resp.Value;


                    vm.data.Customer1Prefix(customer.Prefix);
                    vm.data.Customer1FirstName(customer.FirstName);
                    vm.data.Customer1MiddleName(customer.MiddleName);
                    vm.data.Customer1LastName(customer.LastName);
                    vm.data.Customer1Suffix(customer.Suffix);
                    vm.data.Customer1SSN(customer.SSN);
                    (customer.DOB == null) ? vm.data.Customer1DOB(null) : vm.data.Customer1DOB(new Date(customer.DOB));
                    vm.data.Customer1Email(customer.Email);


                } else {
                    //alert("clear data on pri");
                    //vm.data.setVal(null);
                    vm.data.markClean(resp.Value, true);
                    notify.notify('warn', 'Account ID not found', 7);
                    vm.clearData();
                }
            }, utils.no_op));
        } else {
            //load data on UI for customer 2
            dataservice.swingaccountsrv.CustomerSwingInfo.post(null, swingParam, null, utils.safeCallback(null, function(err, resp) {
                if (err) {
                    notify.notify('warn', err.Message, 10);
                    //vm.focusFirst(true);
                } else if (resp.Value) {
                    //we are not sure if this is the correct way of assign value to UI
                    //we are not sure if this is the correct way of assign value to UI
                    var customer = resp.Value;
                    vm.data.Customer2Prefix(customer.Prefix);
                    vm.data.Customer2FirstName(customer.FirstName);
                    vm.data.Customer2MiddleName(customer.MiddleName);
                    vm.data.Customer2LastName(customer.LastName);
                    vm.data.Customer2Suffix(customer.Suffix);
                    vm.data.Customer2SSN(customer.SSN);
                    (customer.DOB == null) ? vm.data.Customer2DOB(null) : vm.data.Customer2DOB(new Date(customer.DOB));
                    vm.data.Customer2Email(customer.Email);


                } else {
                    //alert("clear data on sec");
                    //vm.data.setVal(null);
                    vm.data.markClean(resp.Value, true);
                    notify.notify('warn', 'Account ID not found', 7);
                    vm.clearData();
                }
            }, utils.no_op));
        }
    }


    //used to extract msaccount details like customer info, premise address,
    //emergency contacts and Equipment Details and load into the SWING UI
    //msAccount- result from search
    //system details
    function load_msaccount_details(vm, msAccount) {

        //load data on UI for Premise Address
        //alert(msAccount.AccountID);

        dataservice.swingaccountsrv.CustomerSwingPremiseAddress.read({
                id: msAccount.AccountID
            },
            null, utils.safeCallback(null, function(err, resp) {
                if (err) {
                    notify.notify('warn', err.Message, 10);
                    //vm.focusFirst(true);
                } else if (resp.Value) {
                    //we are not sure if this is the correct way of assign value to UI 

                    var customer = resp.Value;

                    vm.data.StreetAddress1(customer.StreetAddress1);
                    vm.data.StreetAddress2(customer.StreetAddress2);
                    vm.data.City(customer.City);
                    vm.data.County(customer.County);
                    vm.data.PostalCode(customer.PostalCode);
                    vm.data.State(customer.State);
                } else {
                    //vm.data.setVal(null);
                    vm.data.markClean(resp.Value, true);
                    notify.notify('warn', 'Account ID not found', 7);
                    vm.clearData();
                }

            }, utils.no_op));


        //load data on UI for Emergency Contact

        dataservice.swingaccountsrv.CustomerSwingEmergencyContact.read({
            id: msAccount.AccountID
        }, null, utils.safeCallback(null, function(err, resp) {
            if (err) {
                notify.notify('warn', err.Message, 10);
                //vm.focusFirst(true);
            } else if (resp.Value) {

                var customer = resp.Value,
                    len = customer.length,
                    data = [],
                    mi = '',
                    x;

                if (len > 0) {
                    for (x = 0; x < len; x++) {

                        mi = customer[x].MiddleInit == null ? customer[x].FirstName + " " + customer[x].LastName : customer[x].FirstName + " " + customer[x].MiddleInit + " " + customer[x].LastName;

                        data.push({
                            Name: mi,
                            Relationship: customer[x].Relationship,
                            Phone: customer[x].PhoneNumber1,
                        });

                    }
                }

                //Update Emergency Contact List
                vm.swingEmGvm.list(data);
            } else {
                //vm.data.setVal(null);
                vm.data.markClean(resp.Value, true);
                notify.notify('warn', 'Account ID not found', 7);
                vm.clearData();
            }
        }, utils.no_op));

        //load data on UI for System Details
        dataservice.swingaccountsrv.CustomerSwingSystemDetails.read({
                id: msAccount.AccountID
            },
            null, utils.safeCallback(null, function(err, resp) {

                if (err) {
                    notify.notify('warn', err.Message, 10);
                } else if (resp.Value) {

                    var customer = resp.Value;

                    vm.data.ServiceType(customer.ServiceType);
                    vm.data.CellularType(customer.CellularType);
                    vm.data.PassPhrase(customer.PassPhrase);
                    vm.data.PanelType(customer.PanelType);
                    vm.data.DslSeizure(customer.DslSeizure);

                } else {

                    vm.data.markClean(resp.Value, true);
                    notify.notify('warn', 'Account ID not found', 7);
                    vm.clearData();
                }

            }, utils.no_op));

        //load data on UI for Equipment Info
        dataservice.swingaccountsrv.CustomerSwingEquipmentInfo.read({
            id: msAccount.AccountID
        }, null, utils.safeCallback(null, function(err, resp) {
            if (err) {
                notify.notify('warn', err.Message, 10);

            } else if (resp.Value) {

                var customer = resp.Value,
                    len = customer.length,
                    data = [],
                    x;

                if (len > 0) {
                    for (x = 0; x < len; x++) {

                        data.push({
                            Zone: customer[x].ZoneTypeName,
                            Equipment: customer[x].FullName,
                            'Location': customer[x].EquipmentLocationDesc,
                        });

                    }
                }

                //Update Equipment Info List
                vm.swingEquipmentGvm.list(data);
            } else {
                //vm.data.setVal(null);
                vm.data.markClean(resp.Value, true);
                notify.notify('warn', 'Account ID not found', 7);
                vm.clearData();
            }

        }, utils.no_op));

        /*
      //load data on UI for Emergency Contact
      dataservice.swingaccountsrv.msAccountEmergencyContact.read({CustomerID: msAccount.Customer1ID},
        null, utils.safeCallback(null, function(err, resp) {

        //we are not sure if this is the correct way of assign value to UI
        var customer, emergencyName, nMiddleInit;

        customer = resp.Value;

        nMiddleInit = (customer.MiddleInit == null || customer.MiddleInit == '') ? '' : customer.MiddleInit;

        emergencyName = customer.FirstName +" "+ nMiddleInit +" "+ customer.LastName;

        //Update Emergency Contact List
        vm.swingEmGvm.list([{
            Name: emergencyName,
            Relationship: customer.Relationship,
            Phone: customer.Phone,
        }]);

        //console.log(JSON.stringify(vm.swingEmGvm.list()));

      }, utils.no_op));


      //load data on UI for Equipment Details
      dataservice.swingaccountsrv.msAccountInventory.read(msAccount.AccountID,
        null, utils.safeCallback(null, function(err, resp) {

        var equipment_name, equipment_zone_name, equipment_location, equipment_Id, equipment_Location_Id, equipment_Zone_Type_Id;

          equipment_Id = resp.Value.EquipmentID;
          equipment_Location_Id = resp.Value.EquipmentLocationId;

          //Retrieve Equipment Name
          dataservice.swingaccountsrv.msAccountEquipment.read(equipment_Id,
            null, utils.safeCallback(null, function(err, resp2) {


                 equipment_name = resp2.Value.EquipmentFullName;  //Equipment Name
                 equipment_Zone_Type_Id = resp2.Value.ZoneTypeID;

                      //Retrieve Zone Name
                      dataservice.swingaccountsrv.msZoneType.read(equipment_Zone_Type_Id,
                        null, utils.safeCallback(null, function(err, resp3) {

                          equipment_zone_name = resp3.Value.ZoneTypeName;

                      }, utils.no_op));

                      //Retrieve Equipment Location
                      dataservice.swingaccountsrv.msEquipmentLocation.read(equipment_Location_Id,
                        null, utils.safeCallback(null, function(err, resp4) {

                          equipment_location = resp4.Value.EquipmentLocationDesc;

                          //Populate Equipment Details grid
                          vm.swingEquipmentGvm.list([{
                            Zone: equipment_zone_name,
                            Equipment: equipment_name,
                            'Location': equipment_location,
                          }]);

                      }, utils.no_op));


          }, utils.no_op));


      }, utils.no_op));*/

    } //end of load_msaccount_details function

    // //used to check if the msaccount is onboard full or onboard lead only
    // //msAccount- result from search
    // //to be used in the swing process
    // function check_onboard(msAccount) {
    //
    //   if (msAccount.PassedCredit == "Yes" && msAccount.FullCustomer == "Yes") {
    //     alert("onboard full");
    //
    //   } else {
    //     alert("onboard lead only");
    //   }
    //   //alert(JSON.stringify(msAccount));
    // }


    return SwingViewModel;
});