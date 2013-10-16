module.exports = function(grunt) {
  "use strict";

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        // footer: 'require("bootstrapper");',
      },
      app: {
        src: [
          // includes
          'js/app/**/*.js',

          '!**/harold.js',
          // excludes
          '!**/specs/**',
          '!**/*spec*.js',
          '!**/static-server.js',
          '!**/*grunt*.js'
        ],
        dest: 'build/app.js',
      },
      lib: {
        src: [
          'js/lib/depends.js',
          // 'js/lib/almond.js',
          'js/lib/jquery*.js',
          'js/lib/knockout.js',
          'js/lib/moment.js',
          'js/lib/underscore.js',
          'js/lib/underscore.define.js',
        ],
        dest: 'build/lib.js',
      },
    },
    connect: {
      specs: {
        options: {
          port: 54345,
          base: './',
        },
      },
    },
    jasmine: {
      //@NOTE:  we're not using any of their generated files
      //        we generated files, moved them, modified them and checked them in
      browser: {
        //src: [
        //	'specs/allspecs.js',
        //],
        options: {
          host: 'http://localhost:54345/',
          //helpers: 'specs/**/*.helper.js',
          //specs: 'specs/**/*.spec.js',
          template: 'specRunner.html',
          outfile: 'specPhantomRunner.html', // copy of specRunner.html
          keepRunner: false,
        },
      },
    },
  });

  grunt.registerTask('test', [
    'connect',
    'jasmine',
  ]);
};
