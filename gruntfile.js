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
				//src: [
				//	'js/requirejsConfig.js',
				//	'js/lib/require.js',
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
