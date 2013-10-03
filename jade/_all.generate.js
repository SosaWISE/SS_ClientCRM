#!/usr/bin/env node

(function() {
  'use strict';

  var path = require('path'),
    fs = require('fs'),
    files = [],
    output = [];

  // read files
  files = fs.readdirSync(__dirname);

  // generate file
  files.forEach(function(name) {
    // exlude files starting with an underscore
    if (name[0] === '_') {
      return;
    }
    // remove file extension
    name = path.basename(name, path.extname(name));
    output.push('#tmpl-' + name + '\n  include ./' + name + '\n');
  });

  // write file
  fs.writeFileSync(path.join(__dirname, '_all.jade'), output.join(''));
})();
