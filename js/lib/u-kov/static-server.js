#!/usr/bin/env node

(function() {
  "use strict";

  var connect = require('connect'),
    http = require('http'),
    app = connect(),
    server = new http.createServer(app);

  app.use(connect.static(__dirname));

  server.listen(54445);
  console.log('listening on ' + server.address().port);
})();
