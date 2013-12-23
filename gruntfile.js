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

    clean: {
      app: 'www/',
    },

    copy: {
      production: {
        files: [
          {
            src: [
              'depends.conf.js',
              'logindummy.html',
              'stuff/fonts/*',
              'stuff/img/*',
            ],
            dest: 'www/'
          },
        ]
      },
    },
    concat: {
      options: {},
      app: {
        src: [
          // includes
          'app/**/*.js',
          'mock/**/*.js',
          // exclude specs
          '!app/**/*.spec.js',
        ],
        dest: 'www/app.js',
      },
      lib: {
        src: [
          'tparty/depends.js',

          'tparty/jquery*.js',
          'tparty/knockout.js',
          'tparty/moment.js',
          'tparty/underscore.js',
          'tparty/markdown.js',

          'tparty/definelibs.js',
        ],
        dest: 'www/lib.js',
      },
    },
    uglify: {
      production: {
        options: {
          mangle: false,
        },
        files: {
          'www/app.min.js': ['www/app.js'],
          'www/lib.min.js': ['www/lib.js'],
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
          'www/index.html': 'index.jade',
        },
      },
    },
    less: {
      production: {
        options: {
          cleancss: true,
        },
        files: {
          'www/index.css': 'index.less',
        },
      },
    },
  });

  grunt.registerTask('default', [
    'copy',
    'concat', 'uglify',
    'jade',
    'less',
  ]);
};
