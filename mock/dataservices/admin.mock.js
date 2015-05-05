define("mock/dataservices/admin.mock", [
  "src/core/strings",
  "src/dataservice",
  "src/core/mockery",
], function(
  strings,
  dataservice,
  mockery
) {
  "use strict";

  function mock(settings) {
    function send(code, value, setter, cb, timeout) {
      mockery.send(code, value, setter, cb, timeout || settings.timeout);
    }

    dataservice.api_admin.actions.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(actions, "ID", id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.api_admin.applications.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(applications, "ID", id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.api_admin.groupActionItems.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(groupActionItems, "ID", id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.api_admin.users.read = function(params, setter, cb) {
      var result; //, id = params.id;
      switch (params.link || null) {
        case null:
          break;
        case "groups":
          result = mockery.fromTemplate({
            "list|1-5": ["@AD_GROUP"],
          }).list;
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.api_admin.groupActionItems.save = function(params, setter, cb) {
      var result, groupName = params.id;
      switch (params.link || null) {
        case null:
          if (groupName) {
            var items = mockery.filterListBy(groupActionItems, "GroupName", groupName);
            var itemMap = {};
            items.forEach(function(item) {
              itemMap[item.RefType + item.ID] = item;
            });
            //
            params.data.forEach(function(savedItem) {
              var item;
              if (savedItem.ID) {
                item = itemMap[savedItem.RefType + savedItem.ID];
                if (!item) {
                  throw new Error("item does not exist");
                }
                item.IsDeleted = savedItem.IsDeleted;
                item.ModifiedOn = new Date();
              } else {
                savedItem.ID = mockery.fromTemplate("@INC(group" + savedItem.RefType + ")");
                item = itemMap[savedItem.RefType + savedItem.ID];
                if (item) {
                  throw new Error("item already exists");
                }
                savedItem.ModifiedOn = new Date();
                groupActionItems.push(savedItem);
              }
            });
            // return all group name items
            result = mockery.filterListBy(groupActionItems, "GroupName", groupName);
          }
          break;
      }
      send(0, result, setter, cb);
    };
  }

  (function() {
    mockery.addModulusValueFunc("AD_GROUP", [
      "Developers",
      "HR Managers",
      "HR Users",
      "Call Center",
      "Customer Service Manager",
    ]);
    mockery.addModulusValueFunc("ACTIONID", [
      "Hr_Team_Edit",
      "Hr_User_Edit",
    ]);
    mockery.addModulusValueFunc("APPLICATIONID", [
      "ADMIN",
      "HR_MAN",
      "NXS_CONNEXT_CORS",
      "SOS_CRM",
      "SOS_GPS_CLNT",
      "SSE_CMS_CORS",
      "SSE_MAIN_PORTAL",
      "SURVEY_MAN",
    ]);
    mockery.addModulusValueFunc("APPLICATION_NAME", [
      "Admin",
      "Hiring Manager",
      "NXS Connext CORS",
      "SOS CRM",
      "SOS GPS Client",
      "SSE Cms CORS",
      "SSE Main Portal App",
      "Survey Manager",
    ]);
  })();

  // data used in mock function
  var actions,
    applications,
    groupActionItems = [],
    groupActionTmpl, //groupActions,
    groupApplicationTmpl; //, groupApplications;

  actions = mockery.fromTemplate({
    "list|2-2": [ //
      {
        ID: "@ACTIONID",
        Name: "@ACTIONID",
      },
    ],
  }).list;
  applications = mockery.fromTemplate({
    "list|8-8": [ //
      {
        ID: "@APPLICATIONID",
        Name: "@APPLICATION_NAME",
      },
    ],
  }).list;

  groupActionTmpl = {
    ID: "@INC(groupActions)",
    // GroupName: "set below",
    RefType: "Actions",
    RefId: "@ACTIONID",
    IsDeleted: false,
  };
  groupActionTmpl.GroupName = "Developers";
  groupActionItems = groupActionItems.concat(mockery.fromTemplate({
    "list|2-2": [groupActionTmpl],
  }).list);
  groupActionTmpl.GroupName = "Call Center";
  groupActionItems = groupActionItems.concat(mockery.fromTemplate({
    "list|2-2": [groupActionTmpl],
  }).list);

  groupApplicationTmpl = {
    ID: "@INC(groupApplications)",
    // GroupName: "set below",
    RefType: "Applications",
    RefId: "@APPLICATIONID",
    IsDeleted: false,
  };
  groupApplicationTmpl.GroupName = "Developers";
  groupActionItems = groupActionItems.concat(mockery.fromTemplate({
    "list|4-4": [groupApplicationTmpl],
  }).list);
  groupApplicationTmpl.GroupName = "Call Center";
  groupActionItems = groupActionItems.concat(mockery.fromTemplate({
    "list|4-4": [groupApplicationTmpl],
  }).list);

  return mock;
});
