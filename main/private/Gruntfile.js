module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: [
        '../public/dependencies/ddp.js/src/ddp.js', '../public/dependencies/q/q.js', '../public/dependencies/asteroid/dist/asteroid.browser.js',
        '../public/dependencies/underscore-min.js', '../public/dependencies/blaze.js', '../public/api.js', '../public/template_controllers.js'
        ],
        dest: '../public/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
};
