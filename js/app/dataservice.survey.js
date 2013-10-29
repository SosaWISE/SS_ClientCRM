define('src/dataservice.survey', [
  'src/util/utils',
  'src/core/dataservice.base',
  'src/config'
], function(
  utils,
  DataserviceBase,
  config
) {
  "use strict";

  function SurveyDataservice() {
    SurveyDataservice.super_.call(this, 'survey', config.serviceDomain);
  }
  utils.inherits(SurveyDataservice, DataserviceBase);

  //@TODO: add methods

  return SurveyDataservice;
});
