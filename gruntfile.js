module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    www: '../crm-www',

    clean: {
      app: {
        options: {
          force: true, // force delete files outside the current working directory
        },
        src: [
          // delete everything in build folder except webconfig.js
          '<%= www %>/*', '!<%= www %>/webconfig.js',
        ]
      }
    },

    copy: {
      production: {
        files: [
          {
            src: [
              'logindummy.html',
              'stuff/fonts/*',
              'stuff/img/*',
              // specs
              'tparty/jasmine/*',
              'tparty/depends.js',
            ],
            dest: '<%= www %>/'
          },
          {
            src: 'depends-production.conf.js',
            dest: '<%= www %>/depends.conf.js',
          },
        ]
      },
    },
    concat: {
      options: {},
      // packages - include package folder js files but not specs
      mock_pkg: {
        src: ['mock/**/*.js', '!app/**/*.spec.js', ],
        dest: '<%= www %>/mock.js',
      },
      core_pkg: {
        src: ['app/core/**/*.js', '!app/core/**/*.spec.js', ],
        dest: '<%= www %>/core.js',
      },
      ukov_pkg: {
        src: ['app/u-kov/**/*.js', '!app/u-kov/**/*.spec.js', ],
        dest: '<%= www %>/ukov.js',
      },
      // app without packages
      app: {
        src: [
          // include app files
          'app/**/*.js',
          // exclude specs and packages
          '!app/**/*.spec.js',
          '!app/core/*',
          '!app/u-kov/*',
        ],
        dest: '<%= www %>/app.js',
      },
      // third party libs
      tparty: {
        src: [
          'tparty/depends.js',

          'tparty/jquery*.js',
          'tparty/knockout.js',
          'tparty/moment.js',
          'tparty/underscore.js',
          'tparty/markdown.js',

          'tparty/definelibs.js',
        ],
        dest: '<%= www %>/lib.js',
      },
      // specs
      spec: {
        src: [
          'app/**/*.spec.js',
          'spec/runner.js',
          'spec/index.js',
        ],
        dest: '<%= www %>/spec.js',
      },
    },
    uglify: {
      production: {
        options: {
          mangle: false,
        },
        files: {
          '<%= www %>/app.min.js': ['<%= www %>/app.js'],
          '<%= www %>/lib.min.js': ['<%= www %>/lib.js'],
        }
      }
    },
    jade: {
      production: {
        options: {
          data: {
            release: true,
          },
        },
        files: {
          '<%= www %>/index.html': 'index.jade',
          '<%= www %>/spec/index.html': 'spec/index.jade',
        },
      },
    },
    less: {
      production: {
        options: {
          cleancss: true,
        },
        files: {
          '<%= www %>/index.css': 'index.less',
        },
      },
    },
  });

  grunt.registerTask('default', [
    'copy',
    'concat',
    'uglify',
    'jade',
    'less',
  ]);
};
