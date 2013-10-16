module.exports = function(grunt) {
  "use strict";

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.initConfig({
    connect: {
      specs: {
        options: {
          port: 54345,
          base: './',
        },
      },
    },
    jasmine: {
      //@NOTE:	we're not using any of their generated files
      //				we generated files, moved them, modified them and checked them in
      browser: {
        options: {
          host: 'http://localhost:54345/',
          // specs: 'allspecs.js',
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
