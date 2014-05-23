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
    '!tparty/**/*.js',
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
              return !grunt.file.exists(path.join(path.join(grunt.config('www'), 'webconfig.js')));
            },
          }, {
            src: [
              'logindummy.html',
              'stuff/fonts/**/*',
              'stuff/img/**/*',
              // specs
              'tparty/jasmine/**/*',
              'tparty/depends.js',
            ],
            dest: '<%= www %>/'
          }, {
            src: 'depends-production.conf.js',
            dest: '<%= www %>/depends.conf.js',
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
          'tparty/jquery.event.drag-*.js',
          'tparty/slick.core.js',
          'tparty/slick.grid.js',
          'tparty/slick.rowselectionmodel.js',
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
          '!app/account/**/*',
          '!app/survey/**/*',
          '!app/core/**/*',
          '!app/slick/**/*',
          '!app/u-kov/**/*',
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
      prod: {
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
      prod: {
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
      dev: {
        options: {
          data: {
            release: false,
          },
        },
        files: {
          'index.html': 'index.jade',
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
          '<%= www %>/index.css': 'index.less',
        },
      },
      dev: {
        options: {
          cleancss: false,
        },
        files: {
          'index.css': 'index.less',
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

    exec: {
      npm_install: 'npm install',
    },
  });

  grunt.registerTask('init', [
    'copy:webconfig',
  ]);

  grunt.registerTask('build', [
    'copy:prod',
    'concat',
    'uglify',
    'jade:prod',
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
    'exec:npm_install', // before running make sure node_modules match package.json
    'jsbeautifier:test', // faster than jshint
    'jshint',
  ]);
};
