define('src/scrum/scrumservice', [
  'src/core/dataservice.base',
  'src/config'
], function(
  DataserviceBase,
  config
) {
  "use strict";

  return function() {
    var serviceDomain = config.serviceDomain + '/scrum',
      result = {};

    [
      'persons',
      'projects',
      'sprints',
      'epics',
      'storytypes',
      'storys',
      'tasksteps',
      'tasks',
    ].forEach(function(collectionName) {
      result[collectionName] = new DataserviceBase(collectionName, serviceDomain);
    });

    return result;
  };
});
