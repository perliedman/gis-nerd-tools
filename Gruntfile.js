module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            basic: {
                src: ['src/index.js'],
                dest: 'site.js'
            }
        },
        'gh-pages': {
            src: [
                'index.html',
                'style.css',
                'site.js',
                'node_modules/leaflet/dist/leaflet.css',
                'node_modules/leaflet/dist/images/*'
            ]
        },
        watch: {
            files: ['src/*.js'],
            tasks: ['browserify']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['browserify']);
    grunt.registerTask('publish', ['default', 'gh-pages']);
};
