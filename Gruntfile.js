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
    env: {
      all: {
        MOCHA_FILE: 'shippable/testresults/tests.xml'
      }
    },
    clean: ['shippable'],
		mochaTest: {
			test: {
				options: {
          reporter: 'mocha-multi',
          reporterOptions: {
            spec: '-',
            'mocha-junit-reporter': '-' 
          },
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
					reporterOutput: 'shippable/jshint/jshint-checkstyle-result.xml'
				}
			}
		},
    /* jshint camelcase:false */
    mocha_istanbul: {
      test: {
        options: {
          reporter: 'mocha-jenkins-reporter',
          coverageFolder: 'shippable/codecoverage',
          timeout: config.timeout,
          require: config.require,
          reportFormats: ['cobertura'],
          quiet: true
        },
        src: config.targets.test
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
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task.
	grunt.registerTask('default', ['env:all', 'clean', 'jshint:stdout', 'mochaTest']);
	grunt.registerTask('ci', ['env:all', 'clean', 'jshint:checkstyle', 'mocha_istanbul', 'mochaTest']);
};
