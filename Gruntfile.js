module.exports = function(grunt) {

	grunt.initConfig({
		concat: {
			options: {
				stripBanners: true
			}
			, js: {
				src: [
					'src/state-tracker.js', 'src/state-tracker.service.js', 'src/state-tracker.filters.js',
					'src/state-tracker.directives.js'
				]
				, dest: 'dist/state-tracker.min.js'
			}
		}
		, ngmin: {
			dist: {
				files: [{
					expand: true
					, src: '<%= concat.js.dest %>'
					, dest: ''
				}]
			}
		}
		, uglify: {
			options: {
				banner: '/*! Angular State Tracker <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			}
			, dist: {
				files: {
					'<%= concat.js.dest %>': ['<%= concat.js.dest %>']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ngmin');

	grunt.registerTask('default', [
		'concat', 'ngmin', 'uglify'
	]);
};
