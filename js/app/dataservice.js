define('src/dataservice', [
  'src/dataservice.qualify'
], function(
  QualifyDataservice
) {
  "use strict";
  return {
    qualify: new QualifyDataservice(),
  };
});
