module.exports = function(grunt) {
  'use strict';

  var path = require('path'),
    jsfiles;

  jsfiles = [
    '**/*.js',
    // exclude files
    '!app/flowMap/**/*.js',
    '!node_modules/**/*.js',
    '!testing/**/*.js',
    '!**/tparty/**/*.js', // exclude any and every tparty folder
  ];

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-exec');

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
          '<%= www %>/**/*', '!<%= www %>/webconfig.js',
        ]
      }
    },

    copy: {
      webconfig: {
        src: 'webconfig-example.js',
        dest: 'webconfig.js',
        filter: function() { // only copy if webconfig.js doesn't exist
          return !grunt.file.exists('webconfig.js');
        },
      },
      prod: {
        files: [ //
          {
            src: 'webconfig-example.js',
            dest: '<%= www %>/webconfig.js',
            filter: function() { // only copy if webconfig.js doesn't exist in output dir
              return !grunt.file.exists(path.join(grunt.config('www'), 'webconfig.js'));
            },
          }, {
            src: [
              'logindummy.html',
              'stuff/**/*',
              // specs
              'tparty/jasmine/**/*',
              'app/depends/depends.js',
            ],
            dest: '<%= www %>/'
          }, {
            src: 'depends-production.conf.js',
            dest: '<%= www %>/depends.conf.js',
          }, {
            src: 'depends-production.debug.conf.js',
            dest: '<%= www %>/depends.debug.conf.js',
          }, {
            src: 'tparty/pixi.dev.js',
            dest: '<%= www %>/pixi.debug.js',
          },
        ],
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
          'app/slick/tparty/slick.core.js',
          'app/slick/tparty/slick.grid.js',
          'app/slick/tparty/slick.rowselectionmodel.js',
          'app/slick/tparty/slick.editors.js',
          'app/slick/tparty/slick.dataview.js',
          'app/slick/tparty/slick-production.js',
          // actual package
          'app/slick/*.js',
          // except
          '!app/slick/slick-dev.js',
          '!app/slick/*.spec.js',
        ],
        dest: '<%= www %>/slick.debug.js',
      },
      wamp_pkg: {
        src: [
          // third party libs
          'app/wamp/tparty/autobahn.js',
          // actual package
          'app/wamp/*.js',
          // except
          '!app/wamp/*.spec.js',
        ],
        dest: '<%= www %>/wamp.debug.js',
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
          'app/crm/*.js',
          'app/ukov.js',
          'app/dataservices/*.js', 'app/dataservice.js',
          'app/home/*.js',
          'app/hr/*.js', 'app/viz/*.js',
          'app/inventory/*.js',
          'app/login/*.js',
          'app/scheduler/*.js',
          'app/scheduling/*.js',
          'app/swing/*.js',
          // exclude specs
          '!app/**/*.spec.js',
        ],
        dest: '<%= www %>/app.debug.js',
      },
      // third party libs
      tparty: {
        src: [
          'app/depends/depends.js',

          'tparty/jquery-1.10.2.js',
          'tparty/jquery-ui-1.10.4.custom.js',
          'tparty/jquery.event.drag-*.js',
          'tparty/knockout.js',
          'tparty/moment.js',
          'tparty/underscore.js',
          'tparty/markdown.js',
          'tparty/definelibs.js',
          'tparty/fullcalendar.js',
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
      prod: {
        options: {
          mangle: true,
        },
        files: {
          '<%= www %>/account.js': ['<%= www %>/account.debug.js'],
          '<%= www %>/survey.js': ['<%= www %>/survey.debug.js'],
          '<%= www %>/core.js': ['<%= www %>/core.debug.js'],
          '<%= www %>/slick.js': ['<%= www %>/slick.debug.js'],
          '<%= www %>/wamp.js': ['<%= www %>/wamp.debug.js'],
          '<%= www %>/pixi.js': ['<%= www %>/pixi.debug.js'],
          '<%= www %>/ukov.js': ['<%= www %>/ukov.debug.js'],
          '<%= www %>/mock.js': ['<%= www %>/mock.debug.js'],

          '<%= www %>/app.js': ['<%= www %>/app.debug.js'],
          '<%= www %>/lib.js': ['<%= www %>/lib.debug.js'],
        }
      }
    },
    jade: {
      index: {
        files: {
          '<%= www %>/index.html': 'index.jade',
        },
      },
      prod: {
        options: {
          data: {
            release: true,
            // release: false,
            // debug: true,
          },
        },
        files: {
          '<%= www %>/crm/index.html': 'crm/index.jade',
          '<%= www %>/spec/index.html': 'spec/index.jade',
        },
      },
      prod_debug: {
        options: {
          data: {
            release: false,
            debug: true,
          },
        },
        files: {
          '<%= www %>/crm/index.debug.html': 'crm/index.jade',
          '<%= www %>/spec/index.debug.html': 'spec/index.jade',
        },
      },
      dev: {
        options: {
          data: {
            release: false,
          },
        },
        files: {
          'crm/index.html': 'crm/index.jade',
          'spec/index.html': 'spec/index.jade',
        },
      },
    },
    less: {
      prod: {
        options: {
          cleancss: true,
        },
        files: {
          '<%= www %>/crm/index.css': 'crm/index.less',
        },
      },
      dev: {
        options: {
          cleancss: false,
        },
        files: {
          'crm/index.css': 'crm/index.less',
        },
      },
    },

    jsbeautifier: {
      format: {
        src: jsfiles,
        options: {
          config: '.jsbeautifyrc',
        },
      },
      test: {
        src: jsfiles,
        options: {
          config: '.jsbeautifyrc',
          mode: 'VERIFY_ONLY',
        },
      },
    },
    jshint: {
      jsfiles: jsfiles,
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // exec: {
    //   npm_install: 'npm install',
    // },
  });

  grunt.registerTask('init', [
    'copy:webconfig',
  ]);

  grunt.registerTask('build', [
    'copy:prod',
    'concat',
    'uglify',
    'jade:index',
    'jade:prod',
    'jade:prod_debug',
    'less:prod',
  ]);
  grunt.registerTask('build-dev', [
    'jade:dev',
    'less:dev',
  ]);
  grunt.registerTask('jsformat', [
    'jsbeautifier:format',
  ]);



  grunt.registerTask('precommit', [
    // 'exec:npm_install', // before running make sure node_modules match package.json
    'jsbeautifier:test', // faster than jshint
    'jshint',
  ]);
};
