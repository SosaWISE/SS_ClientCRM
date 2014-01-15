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
      account_pkg: {
        src: ['app/account/**/*.js', '!app/account/**/*.spec.js', ],
        dest: '<%= www %>/account.debug.js',
      },
      survey_pkg: {
        src: ['app/survey/**/*.js', '!app/survey/**/*.spec.js', ],
        dest: '<%= www %>/survey.debug.js',
      },
      core_pkg: {
        src: ['app/core/**/*.js', '!app/core/**/*.spec.js', ],
        dest: '<%= www %>/core.debug.js',
      },
      slick_pkg: {
        src: [
          // third party libs
          'tparty/jquery.event.drag-*.js',
          'tparty/slick.core.js',
          'tparty/slick.grid.js',
          'tparty/slick.rowselectionmodel',
          'tparty/slick-production.js',
          // actual package
          'app/slick/**/*.js', '!app/slick/**/*.spec.js',
        ],
        dest: '<%= www %>/slick.debug.js',
      },
      ukov_pkg: {
        src: ['app/u-kov/**/*.js', '!app/u-kov/**/*.spec.js', ],
        dest: '<%= www %>/ukov.debug.js',
      },
      mock_pkg: {
        src: ['mock/**/*.js', '!app/**/*.spec.js', ],
        dest: '<%= www %>/mock.debug.js',
      },
      // app without packages
      app: {
        src: [
          // include app files
          'app/**/*.js',
          // exclude specs and packages
          '!app/**/*.spec.js',
          '!app/account/*',
          '!app/survey/*',
          '!app/core/*',
          '!app/slick/*',
          '!app/u-kov/*',
        ],
        dest: '<%= www %>/app.debug.js',
      },
      // third party libs
      tparty: {
        src: [
          'tparty/depends.js',

          'tparty/jquery-*.js',
          'tparty/knockout.js',
          'tparty/moment.js',
          'tparty/underscore.js',
          'tparty/markdown.js',

          'tparty/definelibs.js',
        ],
        dest: '<%= www %>/lib.debug.js',
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
          '<%= www %>/account.js': ['<%= www %>/account.debug.js'],
          '<%= www %>/survey.js': ['<%= www %>/survey.debug.js'],
          '<%= www %>/core.js': ['<%= www %>/core.debug.js'],
          '<%= www %>/slick.js': ['<%= www %>/slick.debug.js'],
          '<%= www %>/ukov.js': ['<%= www %>/ukov.debug.js'],
          '<%= www %>/mock.js': ['<%= www %>/mock.debug.js'],

          '<%= www %>/app.js': ['<%= www %>/app.debug.js'],
          '<%= www %>/lib.js': ['<%= www %>/lib.debug.js'],
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
