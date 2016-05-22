module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					style: 'expanded'	
				},
				files: {
					'dist/flip-navigation-bar.css': 'flip-navigation-bar.scss'
				}
			}
		},
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'dist/',
					src: ['*.css', '!*.min.css'],
					dest: 'dist/',
					ext: '.min.css'
				}]	
			}	
		},
		uglify: {
			options: {
				banner: '/* <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy")%> */\n'			 
			},
			dist: {
				files: {
					'dist/<%=pkg.name%>.min.js': '<%= pkg.name %>.js'
				}		  
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['sass', 'cssmin', 'uglify']);
};
