'use strict';
var config = {
	targets: {
		test: ['test/**/*.js'],
		bin: ['bin/*.js'],
		src: ['lib/**/*.js', '*.js']
	},
	timeout: 5000,
	require: ['deride', 'should']
};
config.targets.all = config.targets.test.concat(config.targets.bin).concat(config.targets.src);

module.exports = function(grunt) {
	grunt.initConfig({
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					timeout: config.timeout,
					require: config.require
				},
				src: config.targets.test 
			}
		},
		/* jshint camelcase:false */
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			stdout: {
				src: config.targets.all,
			},
			checkstyle: {
				src: config.targets.all,
				options: {
					reporter: 'checkstyle',
					reporterOutput: 'reports/jshint-checkstyle-result.xml'
				}
			}
		},
		watch: {
			files: config.targets.all,
			tasks: ['default']
		}
	});

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-notify');

	// Default task.
	grunt.registerTask('default', ['jshint:stdout', 'mochaTest']);
};
