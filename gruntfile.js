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
          'js/**/*.js',

          // excludes
          '!js/depends.conf.js', '!js/core/depends.js',
          '!js/**/*.spec.js',
        ],
        dest: 'build/app.js',
      },
      lib: {
        src: [
          'js/core/depends.js',
          // 'lib/almond.js',
          'lib/jquery*.js',
          'lib/knockout.js',
          'lib/moment.js',
          'lib/underscore.js',
          'lib/markdown.js',
          'lib/definelibs.js',
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
